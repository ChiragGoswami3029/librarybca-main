import os
import tempfile
import unittest
from unittest.mock import MagicMock, patch

import requests
from botocore.exceptions import ClientError

os.environ.setdefault("JWT_SECRET_KEY", "test-only-secret")
os.environ.setdefault("DATABASE_URL", "sqlite:///b2_upload_test.db")

from app import create_app
from models import FileItem, User, db
from routes.files import b2_upload_token_serializer
from flask_jwt_extended import create_access_token


class FakeB2Storage:
    def __init__(self, size=12):
        self.size = size
        self.deleted = []
        self.get_requests = []

    def create_presigned_put_url(self, object_key, content_type):
        return f"https://s3.example.test/bucket/{object_key}?signed=1"

    def head_object(self, object_key):
        return {"ContentLength": self.size}

    def delete_object(self, object_key):
        self.deleted.append(object_key)

    def create_presigned_get_url(self, object_key, download_name=None):
        self.get_requests.append((object_key, download_name))
        return f"https://s3.example.test/bucket/{object_key}?get=1"


class B2UploadTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.database_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        cls.database_file.close()
        os.environ["DATABASE_URL"] = "sqlite:///" + cls.database_file.name.replace("\\", "/")
        cls.app = create_app()
        cls.app.config.update(TESTING=True, WTF_CSRF_ENABLED=False)
        with cls.app.app_context():
            db.drop_all()
            db.create_all()
            user = User(name="B2 Tester", email="b2@example.test")
            user.set_password("password")
            db.session.add(user)
            db.session.commit()
            cls.user_id = user.id

    @classmethod
    def tearDownClass(cls):
        try:
            os.unlink(cls.database_file.name)
        except FileNotFoundError:
            pass

    def setUp(self):
        self.client = self.app.test_client()
        with self.app.app_context():
            self.token = create_access_token(identity=str(self.user_id))
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def sign(self, size=12):
        return self.client.post(
            "/upload/b2/signature",
            headers=self.headers,
            json={
                "filename": "notes.pdf",
                "size": size,
                "content_type": "application/pdf",
            },
        )

    def test_unauthenticated_signing_is_rejected(self):
        response = self.client.post(
            "/upload/b2/signature",
            json={"filename": "notes.pdf", "size": 12},
        )
        self.assertEqual(response.status_code, 401)

    @patch("routes.files.b2_storage")
    def test_authenticated_signing_succeeds(self, storage_factory):
        storage_factory.return_value = FakeB2Storage()
        response = self.sign()
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json["upload_url"].startswith("https://"))
        self.assertTrue(response.json["object_key"].startswith(f"uploads/{self.user_id}/"))
        self.assertNotIn("B2_APPLICATION_KEY", response.get_data(as_text=True))

    def test_upload_over_limit_is_rejected(self):
        response = self.sign(size=25 * 1024 * 1024 + 1)
        self.assertEqual(response.status_code, 413)

    @patch("routes.files.b2_storage")
    def test_invalid_object_key_is_rejected(self, storage_factory):
        storage = FakeB2Storage()
        storage_factory.return_value = storage
        signed = self.sign().json
        with self.app.app_context():
            forged = b2_upload_token_serializer().dumps({
                "user_id": self.user_id,
                "object_key": f"uploads/{self.user_id}/other.pdf",
                "original_name": "notes.pdf",
                "file_size": 12,
                "content_type": "application/pdf",
            })
        response = self.client.post(
            "/upload/b2/metadata",
            headers=self.headers,
            json={"upload_token": forged, "original_name": "notes.pdf"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(storage.deleted)
        self.assertNotEqual(signed["object_key"], f"uploads/{self.user_id}/other.pdf")

    @patch("routes.files.b2_storage")
    def test_duplicate_finalization_is_rejected(self, storage_factory):
        storage_factory.return_value = FakeB2Storage()
        signed = self.sign().json
        metadata = {
            "upload_token": signed["upload_token"],
            "original_name": "notes.pdf",
            "title": "Notes",
            "category": "Notes",
            "subject": "Data Structures",
            "semester": "3",
        }
        first = self.client.post("/upload/b2/metadata", headers=self.headers, json=metadata)
        second = self.client.post("/upload/b2/metadata", headers=self.headers, json=metadata)
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 409)

    @patch("routes.files.b2_storage")
    def test_database_failure_triggers_b2_cleanup(self, storage_factory):
        storage = FakeB2Storage()
        storage_factory.return_value = storage
        signed = self.sign().json
        metadata = {
            "upload_token": signed["upload_token"],
            "original_name": "notes.pdf",
            "title": "Notes",
            "category": "Notes",
            "subject": "Data Structures",
            "semester": "3",
        }
        with patch.object(db.session, "commit", side_effect=RuntimeError("db down")):
            response = self.client.post("/upload/b2/metadata", headers=self.headers, json=metadata)
        self.assertEqual(response.status_code, 500)
        self.assertEqual(storage.deleted, [signed["object_key"]])
        with self.app.app_context():
            self.assertIsNone(FileItem.query.filter_by(filename=signed["object_key"]).first())

    @patch("routes.files.b2_storage")
    def test_b2_view_returns_presigned_get_url(self, storage_factory):
        storage = FakeB2Storage()
        storage_factory.return_value = storage
        with self.app.app_context():
            record = FileItem(
                title="B2 Notes",
                category="Notes",
                subject="Data Structures",
                semester="3",
                filename="uploads/1/notes.pdf",
                original_name="notes.pdf",
                uploader_id=self.user_id,
            )
            db.session.add(record)
            db.session.commit()
            file_id = record.id

        response = self.client.get(f"/files/{file_id}/view")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.location, "https://s3.example.test/bucket/uploads/1/notes.pdf?get=1")
        self.assertEqual(storage.get_requests, [("uploads/1/notes.pdf", None)])

    @patch("routes.files.b2_storage")
    def test_b2_download_returns_attachment_presigned_get_url(self, storage_factory):
        storage = FakeB2Storage()
        storage_factory.return_value = storage
        with self.app.app_context():
            record = FileItem(
                title="B2 Notes",
                category="Notes",
                subject="Data Structures",
                semester="3",
                filename="uploads/1/notes.pdf",
                original_name="notes.pdf",
                uploader_id=self.user_id,
            )
            db.session.add(record)
            db.session.commit()
            file_id = record.id

        response = self.client.get(f"/files/{file_id}/download")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.location, "https://s3.example.test/bucket/uploads/1/notes.pdf?get=1")
        self.assertEqual(storage.get_requests, [("uploads/1/notes.pdf", "notes.pdf")])

    @patch("routes.files.b2_storage")
    def test_missing_b2_object_returns_not_found(self, storage_factory):
        storage = FakeB2Storage()
        storage.head_object = lambda object_key: (_ for _ in ()).throw(
            ClientError(
                {"Error": {"Code": "NoSuchKey"}},
                "HeadObject",
            )
        )
        storage_factory.return_value = storage
        with self.app.app_context():
            record = FileItem(
                title="Missing B2 Notes",
                category="Notes",
                subject="Data Structures",
                semester="3",
                filename="uploads/1/missing.pdf",
                original_name="missing.pdf",
                uploader_id=self.user_id,
            )
            db.session.add(record)
            db.session.commit()
            file_id = record.id

        response = self.client.get(f"/files/{file_id}/view")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json, {"error": "File not found"})

    def test_cloudinary_view_still_redirects(self):
        with self.app.app_context():
            record = FileItem(
                title="Cloudinary Notes",
                category="Notes",
                subject="Data Structures",
                semester="3",
                filename="https://res.cloudinary.com/demo/image/upload/notes.pdf",
                original_name="notes.pdf",
                uploader_id=self.user_id,
            )
            db.session.add(record)
            db.session.commit()
            file_id = record.id

        response = self.client.get(f"/files/{file_id}/view")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.location, "https://res.cloudinary.com/demo/raw/upload/notes.pdf")

    @patch("routes.files.requests.get")
    def test_cloudinary_download_still_streams_attachment(self, requests_get):
        upstream = MagicMock()
        upstream.status_code = 200
        upstream.headers["Content-Type"] = "application/pdf"
        upstream.headers["Content-Length"] = "4"
        upstream.iter_content = lambda chunk_size: iter([b"test"])
        requests_get.return_value = upstream
        with self.app.app_context():
            record = FileItem(
                title="Cloudinary Notes",
                category="Notes",
                subject="Data Structures",
                semester="3",
                filename="https://res.cloudinary.com/demo/image/upload/notes.pdf",
                original_name="notes.pdf",
                uploader_id=self.user_id,
            )
            db.session.add(record)
            db.session.commit()
            file_id = record.id

        response = self.client.get(f"/files/{file_id}/download")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Disposition"], 'attachment; filename=notes.pdf')
        self.assertEqual(response.data, b"test")
        requests_get.assert_called_once_with(
            "https://res.cloudinary.com/demo/raw/upload/notes.pdf",
            stream=True,
            timeout=60,
        )


if __name__ == "__main__":
    unittest.main()