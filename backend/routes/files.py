import os
import uuid
import logging
import time
import cloudinary
import cloudinary.uploader
import cloudinary.utils
import requests
from botocore.exceptions import ClientError
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from urllib.parse import unquote, urlsplit, urlunsplit
from flask import Blueprint, request, jsonify, send_from_directory, current_app, redirect, Response, stream_with_context
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, FileItem, Notification, Follow

files_bp = Blueprint("files", __name__)
logger = logging.getLogger(__name__)
RAW_EXTENSIONS = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip", ".txt"}


def upload_token_serializer():
    return URLSafeTimedSerializer(current_app.config["JWT_SECRET_KEY"], salt="cloudinary-upload")


def b2_upload_token_serializer():
    return URLSafeTimedSerializer(current_app.config["JWT_SECRET_KEY"], salt="b2-upload")


def b2_storage():
    from storage.b2 import B2Storage

    return B2Storage.from_config(current_app.config)


def cloudinary_upload_url(resource_type):
    cloud_name = cloudinary.config().cloud_name
    return f"https://api.cloudinary.com/v1_1/{cloud_name}/{resource_type}/upload"


def allowed_file(filename):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in current_app.config["ALLOWED_EXTENSIONS"]


def cloudinary_delivery_url(record) -> str:
    """Return a delivery URL with the resource type used for this file."""
    url = record.filename
    if not isinstance(url, str) or not url.startswith("http"):
        return url if isinstance(url, str) else ""

    ext = os.path.splitext(record.original_name or "")[1].lower()
    if ext not in {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip", ".txt"}:
        return url

    parsed = urlsplit(url)
    path = parsed.path.replace("/image/upload/", "/raw/upload/", 1)
    return urlunsplit((parsed.scheme, parsed.netloc, path, parsed.query, parsed.fragment))


def cloudinary_asset_details(record):
    url = record.filename
    if not isinstance(url, str) or not url.startswith("http"):
        return None

    parsed = urlsplit(url)
    path_parts = parsed.path.split("/upload/", 1)
    if len(path_parts) != 2:
        return None

    resource_type = "raw" if "/raw/" in path_parts[0] else "image"
    public_id = path_parts[1]
    public_id_parts = public_id.split("/")
    if public_id_parts and public_id_parts[0].startswith("v") and public_id_parts[0][1:].isdigit():
        public_id_parts.pop(0)

    return unquote("/".join(public_id_parts)), resource_type


def delete_cloudinary_asset(record):
    asset_details = cloudinary_asset_details(record)
    if not asset_details:
        return

    public_id, resource_type = asset_details
    resource_types = [resource_type]
    if resource_type == "image" and os.path.splitext(record.original_name or "")[1].lower() in {
        ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip", ".txt"
    }:
        resource_types.append("raw")

    for asset_resource_type in resource_types:
        try:
            result = cloudinary.uploader.destroy(public_id, resource_type=asset_resource_type)
            if result.get("result") == "ok":
                return
            logger.warning(
                "Cloudinary deletion returned %s for file %s using resource type %s",
                result.get("result"),
                record.id,
                asset_resource_type,
            )
        except Exception:
            logger.warning(
                "Cloudinary deletion failed for file %s using resource type %s",
                record.id,
                asset_resource_type,
                exc_info=True,
            )


def cleanup_cloudinary_upload(public_id, resource_type):
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        if result.get("result") not in {"ok", "not found"}:
            logger.warning(
                "Cloudinary cleanup returned %s for upload %s using resource type %s",
                result.get("result"),
                public_id,
                resource_type,
            )
    except Exception:
        logger.warning("Cloudinary cleanup failed for upload %s", public_id, exc_info=True)


def cloudinary_public_id_exists(public_id):
    return FileItem.query.filter(FileItem.filename.like(f"%/{public_id}")).first() is not None


def notify_followers(file_record):
    # Alert every user following this subject that a new file landed
    followers = Follow.query.filter_by(subject=file_record.subject).all()
    for f in followers:
        if f.user_id == file_record.uploader_id:
            continue  # don't notify yourself about your own upload
        note = Notification(
            user_id=f.user_id,  #type: ignore
            file_id=file_record.id,  #type: ignore
            message=f'New {file_record.category} uploaded for {file_record.subject}: "{file_record.title}"',#type: ignore
        ) 
        db.session.add(note)
    db.session.commit()   


@files_bp.route("/upload/signature", methods=["POST"])
@jwt_required()
def create_upload_signature():
    data = request.get_json(silent=True) or {}
    original_name = secure_filename((data.get("filename") or "").strip())
    file_size = data.get("size")

    if not original_name or not allowed_file(original_name):
        return jsonify({"error": "Invalid or missing file type"}), 400
    if not isinstance(file_size, int) or file_size <= 0:
        return jsonify({"error": "A valid file size is required"}), 400
    if file_size > current_app.config["MAX_UPLOAD_SIZE"]:
        return jsonify({"error": "File exceeds the maximum allowed size"}), 413

    ext = os.path.splitext(original_name)[1].lower()
    resource_type = "raw" if ext in RAW_EXTENSIONS else "image"
    public_id = f"{uuid.uuid4().hex}{ext if resource_type == 'raw' else ''}"
    timestamp = int(time.time())
    params_to_sign = {"public_id": public_id, "timestamp": timestamp}
    signature = cloudinary.utils.api_sign_request(
        params_to_sign,
        cloudinary.config().api_secret,
    )
    upload_token = upload_token_serializer().dumps({
        "user_id": int(get_jwt_identity()),
        "public_id": public_id,
        "resource_type": resource_type,
        "original_name": original_name,
    })

    return jsonify({
        "api_key": cloudinary.config().api_key,
        "cloud_name": cloudinary.config().cloud_name,
        "resource_type": resource_type,
        "public_id": public_id,
        "timestamp": timestamp,
        "signature": signature,
        "upload_token": upload_token,
        "upload_url": cloudinary_upload_url(resource_type),
        "max_file_size": current_app.config["MAX_UPLOAD_SIZE"],
    }), 200


@files_bp.route("/upload/metadata", methods=["POST"])
@jwt_required()
def finalize_direct_upload():
    data = request.get_json(silent=True) or {}
    upload_result = data.get("cloudinary") or {}
    upload_token = data.get("upload_token")
    user_id = int(get_jwt_identity())

    try:
        if not isinstance(upload_token, str):
            raise BadSignature("missing upload token")
        token_data = upload_token_serializer().loads(upload_token, max_age=900)
    except (BadSignature, SignatureExpired, TypeError):
        return jsonify({"error": "Invalid or expired upload authorization"}), 400

    if token_data.get("user_id") != user_id:
        return jsonify({"error": "Upload authorization does not belong to this user"}), 403

    public_id = upload_result.get("public_id")
    version = upload_result.get("version")
    response_signature = upload_result.get("signature")
    resource_type = upload_result.get("resource_type")
    secure_url = upload_result.get("secure_url")
    byte_count = upload_result.get("bytes")
    original_name = secure_filename((data.get("original_name") or "").strip())

    authorized_asset = (
        public_id == token_data.get("public_id")
        and resource_type == token_data.get("resource_type")
    )
    try:
        if (
            not authorized_asset
            or original_name != token_data.get("original_name")
            or not isinstance(version, int)
            or not response_signature
            or not cloudinary.utils.verify_api_response_signature(public_id, version, response_signature)
        ):
            raise ValueError("Invalid Cloudinary upload result")

        if not isinstance(byte_count, int) or byte_count <= 0 or byte_count > current_app.config["MAX_UPLOAD_SIZE"]:
            raise ValueError("Uploaded file exceeds the maximum allowed size")
        if not isinstance(secure_url, str):
            raise ValueError("Invalid Cloudinary URL")
        parsed_url = urlsplit(secure_url)
        expected_path_prefix = (
            f"/{cloudinary.config().cloud_name}/{resource_type}/upload/"
        )
        public_id_path = parsed_url.path[len(expected_path_prefix):]
        if not (
            parsed_url.scheme == "https"
            and parsed_url.netloc == "res.cloudinary.com"
            and parsed_url.path.startswith(expected_path_prefix)
            and public_id_path.rsplit("/", 1)[-1] == public_id
        ):
            raise ValueError("Invalid Cloudinary URL")
    except Exception as error:
        expected_public_id = token_data.get("public_id")
        expected_resource_type = token_data.get("resource_type")
        if (
            isinstance(expected_public_id, str)
            and expected_resource_type in {"image", "raw"}
            and not cloudinary_public_id_exists(expected_public_id)
        ):
            cleanup_cloudinary_upload(expected_public_id, expected_resource_type)
        status_code = 413 if str(error) == "Uploaded file exceeds the maximum allowed size" else 400
        return jsonify({"error": str(error)}), status_code

    if cloudinary_public_id_exists(public_id):
        return jsonify({"error": "Upload authorization has already been finalized"}), 409

    title = (data.get("title") or "").strip()
    category = data.get("category")
    subject = (data.get("subject") or "").strip()
    semester = data.get("semester")
    if not title or not category or not subject or not semester:
        if not cloudinary_public_id_exists(public_id):
            cleanup_cloudinary_upload(public_id, resource_type)
        return jsonify({"error": "title, category, subject and semester are required"}), 400
    if category not in current_app.config["CATEGORIES"]:
        if not cloudinary_public_id_exists(public_id):
            cleanup_cloudinary_upload(public_id, resource_type)
        return jsonify({"error": f"category must be one of {current_app.config['CATEGORIES']}"}), 400

    record = FileItem(
        title=title,  # type: ignore
        category=category,  # type: ignore
        subject=subject,  # type: ignore
        semester=semester,  # type: ignore
        filename=secure_url,  # type: ignore
        original_name=original_name,  # type: ignore
        uploader_id=user_id,  # type: ignore
    )
    try:
        db.session.add(record)
        db.session.commit()
    except Exception:
        db.session.rollback()
        cleanup_cloudinary_upload(public_id, resource_type)
        return jsonify({"error": "Unable to save uploaded file metadata"}), 500

    try:
        notify_followers(record)
    except Exception:
        db.session.rollback()
        logger.exception("Notification creation failed for file %s after metadata commit", record.id)
    return jsonify({"message": "File uploaded", "file": record.to_dict()}), 201


@files_bp.route("/upload/b2/signature", methods=["POST"])
@jwt_required()
def create_b2_upload_signature():
    data = request.get_json(silent=True) or {}
    original_name = secure_filename((data.get("filename") or "").strip())
    file_size = data.get("size")
    content_type = (data.get("content_type") or "application/octet-stream").strip()

    if not original_name or not allowed_file(original_name):
        return jsonify({"error": "Invalid or missing file type"}), 400
    if not isinstance(file_size, int) or file_size <= 0:
        return jsonify({"error": "A valid file size is required"}), 400
    if file_size > current_app.config["MAX_UPLOAD_SIZE"]:
        return jsonify({"error": "File exceeds the maximum allowed size"}), 413
    if not content_type or len(content_type) > 255:
        return jsonify({"error": "Invalid content type"}), 400

    try:
        storage = b2_storage()
        user_id = int(get_jwt_identity())
        extension = os.path.splitext(original_name)[1].lower()
        object_key = f"uploads/{user_id}/{uuid.uuid4().hex}{extension}"
        upload_token = b2_upload_token_serializer().dumps({
            "user_id": user_id,
            "object_key": object_key,
            "original_name": original_name,
            "file_size": file_size,
            "content_type": content_type,
        })
        upload_url = storage.create_presigned_put_url(object_key, content_type)
    except (RuntimeError, ValueError) as error:
        logger.warning("B2 upload signing configuration failed", exc_info=True)
        return jsonify({"error": str(error)}), 503
    except Exception:
        logger.exception("B2 upload signing failed")
        return jsonify({"error": "Unable to prepare B2 upload"}), 503

    return jsonify({
        "upload_url": upload_url,
        "upload_token": upload_token,
        "object_key": object_key,
        "content_type": content_type,
        "expires_in": 900,
    }), 200


@files_bp.route("/upload/b2/metadata", methods=["POST"])
@jwt_required()
def finalize_b2_upload():
    data = request.get_json(silent=True) or {}
    user_id = int(get_jwt_identity())
    upload_token = data.get("upload_token")
    storage = None
    object_key = None

    try:
        if not isinstance(upload_token, str):
            raise BadSignature("missing upload token")
        token_data = b2_upload_token_serializer().loads(upload_token, max_age=900)
        object_key = token_data.get("object_key")
        if token_data.get("user_id") != user_id:
            return jsonify({"error": "Upload authorization does not belong to this user"}), 403

        original_name = secure_filename((data.get("original_name") or "").strip())
        title = (data.get("title") or "").strip()
        category = data.get("category")
        subject = (data.get("subject") or "").strip()
        semester = data.get("semester")
        if (
            not isinstance(object_key, str)
            or not object_key.startswith(f"uploads/{user_id}/")
            or object_key.count("/") != 2
            or object_key != token_data.get("object_key")
        ):
            return jsonify({"error": "Invalid B2 object key"}), 400
        if original_name != token_data.get("original_name"):
            return jsonify({"error": "Filename does not match upload authorization"}), 400
        if not allowed_file(original_name):
            return jsonify({"error": "Invalid or missing file type"}), 400
        if not title or not category or not subject or not semester:
            return jsonify({"error": "title, category, subject and semester are required"}), 400
        if category not in current_app.config["CATEGORIES"]:
            return jsonify({"error": f"category must be one of {current_app.config['CATEGORIES']}"}), 400

        storage = b2_storage()
        if FileItem.query.filter_by(filename=object_key).first():
            return jsonify({"error": "Upload has already been finalized"}), 409
        object_metadata = storage.head_object(object_key)
        if object_metadata.get("ContentLength") != token_data.get("file_size"):
            return jsonify({"error": "Uploaded file size does not match authorization"}), 400

        record = FileItem(
            title=title,
            category=category,
            subject=subject,
            semester=semester,
            filename=object_key,
            original_name=original_name,
            uploader_id=user_id,
        )
        db.session.add(record)
        db.session.commit()
    except (BadSignature, SignatureExpired, TypeError):
        return jsonify({"error": "Invalid or expired upload authorization"}), 400
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") in {"404", "NoSuchKey", "NotFound"}:
            return jsonify({"error": "B2 object was not found"}), 400
        logger.exception("B2 object verification failed")
        return jsonify({"error": "Unable to verify B2 upload"}), 502
    except Exception:
        db.session.rollback()
        if storage and object_key:
            try:
                storage.delete_object(object_key)
            except Exception:
                logger.exception("B2 cleanup failed for object %s", object_key)
        logger.exception("B2 upload finalization failed")
        return jsonify({"error": "Unable to finalize B2 upload"}), 500

    try:
        notify_followers(record)
    except Exception:
        db.session.rollback()
        logger.exception("Notification creation failed for file %s after metadata commit", record.id)
    return jsonify({"message": "File uploaded", "file": record.to_dict()}), 201


@files_bp.route("/upload", methods=["POST"])
@jwt_required()  # must be logged in
def upload_file():
    user_id = int(get_jwt_identity())

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    title = request.form.get("title")
    category = request.form.get("category")
    subject = request.form.get("subject")
    semester = request.form.get("semester")

    file_size = file.content_length
    if not isinstance(file_size, int) or file_size <= 0:
        current_position = file.stream.tell()
        file.stream.seek(0, os.SEEK_END)
        file_size = file.stream.tell()
        file.stream.seek(current_position)
    if file_size > current_app.config["MAX_UPLOAD_SIZE"]:
        return jsonify({"error": "File exceeds the maximum allowed size"}), 413

    if not title or not category or not subject or not semester:
        return jsonify({"error": "title, category, subject and semester are required"}), 400

    if category not in current_app.config["CATEGORIES"]:
        return jsonify({"error": f"category must be one of {current_app.config['CATEGORIES']}"}), 400

    if not file.filename or not allowed_file(file.filename):
        return jsonify({"error": "Invalid or missing file type"}), 400

    original_name = secure_filename(file.filename)

    # Extension nikal kar decide karein ki file raw document hai ya image
    ext = os.path.splitext(original_name)[1].lower()
    raw_extensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip", ".txt"]
    resource_type = "raw" if ext in raw_extensions else "image"
    unique_public_id = f"{uuid.uuid4().hex}{ext}"

    try:
        # 1. Cloudinary par direct upload karein
        upload_result = cloudinary.uploader.upload(
            file,
            resource_type=resource_type,
            public_id=unique_public_id
        )

        # 2. Cloudinary secure public URL lein
        cloudinary_url = upload_result.get("secure_url")
        # 3. Database me URL save karein
        record = FileItem(
            title=title,         # type: ignore
            category=category,    # type: ignore
            subject=subject,       # type: ignore
            semester=semester,    # type: ignore
            filename=cloudinary_url,   # Cloudinary HTTPS URL yahan save hoga # type: ignore
            original_name=original_name,   # type: ignore
            uploader_id=user_id,       # type: ignore
        )  # type: ignore
        db.session.add(record)
        db.session.commit()

        try:
            notify_followers(record)
        except Exception:
            db.session.rollback()
            logger.exception("Notification creation failed for file %s after metadata commit", record.id)

        return jsonify({"message": "File uploaded", "file": record.to_dict()}), 201

    except Exception as e:
        return jsonify({"error": f"Cloudinary upload failed: {str(e)}"}), 500


@files_bp.route("/files", methods=["GET"])
def list_files():
    category = request.args.get("category")
    subject = request.args.get("subject")
    semester = request.args.get("semester")
    q = request.args.get("q")
    sort = request.args.get("sort", "newest")

    query = FileItem.query
    if category:
        query = query.filter_by(category=category)
    if subject:
        query = query.filter_by(subject=subject)
    if semester:
        query = query.filter_by(semester=semester)

    if q:
        from models import User
        like = f"%{q}%"
        query = query.join(User, FileItem.uploader_id == User.id).filter(
            db.or_(
                FileItem.title.ilike(like),
                FileItem.subject.ilike(like),
                User.name.ilike(like),
            )
        )

    if sort == "alphabetical":
        query = query.order_by(FileItem.title.asc())
    elif sort == "oldest":
        query = query.order_by(FileItem.upload_date.asc())
    else:  # newest (default)
        query = query.order_by(FileItem.upload_date.desc())

    results = query.all()
    return jsonify([f.to_dict() for f in results]), 200


@files_bp.route("/files/<int:file_id>/download", methods=["GET"])
def download_file(file_id):
    record = FileItem.query.get_or_404(file_id)

    if record.filename.startswith("http"):
        try:
            upstream = requests.get(cloudinary_delivery_url(record), stream=True, timeout=60)
            upstream.raise_for_status()
        except requests.RequestException:
            if "upstream" in locals():
                upstream.close()
            logger.warning("Cloudinary download failed for file %s", record.id, exc_info=True)
            return jsonify({"error": "File download failed"}), 502

        download_name = os.path.basename(record.original_name or "").strip() or "download"

        def generate():
            try:
                for chunk in upstream.iter_content(chunk_size=64 * 1024):
                    if chunk:
                        yield chunk
            finally:
                upstream.close()

        response = Response(
            stream_with_context(generate()),
            status=200,
            content_type=upstream.headers.get("Content-Type", "application/octet-stream"),
        )
        response.headers.set("Content-Disposition", "attachment", filename=download_name)
        if upstream.headers.get("Content-Length"):
            response.headers["Content-Length"] = upstream.headers["Content-Length"]
        return response

    return send_from_directory(
        current_app.config["UPLOAD_FOLDER"],
        record.filename,
        as_attachment=True,
        download_name=record.original_name,
    )


@files_bp.route("/files/<int:file_id>/view", methods=["GET"])
def view_file(file_id):
    record = FileItem.query.get_or_404(file_id)
    
    # Agar Cloudinary URL hai toh direct view link redirect karein
    if record.filename.startswith("http"):
        return redirect(cloudinary_delivery_url(record))
        
    return send_from_directory(
        current_app.config["UPLOAD_FOLDER"],
        record.filename,
        as_attachment=False,
    )


@files_bp.route("/my-files", methods=["GET"])
@jwt_required()
def my_files():
    user_id = int(get_jwt_identity())
    results = FileItem.query.filter_by(uploader_id=user_id).order_by(FileItem.upload_date.desc()).all()
    return jsonify([f.to_dict() for f in results]), 200


@files_bp.route("/files/<int:file_id>", methods=["PATCH"])
@jwt_required()
def update_file(file_id):
    user_id = int(get_jwt_identity())
    record = FileItem.query.get_or_404(file_id)

    if record.uploader_id != user_id:
        return jsonify({"error": "You can only edit your own uploads"}), 403

    data = request.get_json() or {}
    if "title" in data:
        record.title = data["title"]
    if "category" in data:
        if data["category"] not in current_app.config["CATEGORIES"]:
            return jsonify({"error": "Invalid category"}), 400
        record.category = data["category"]
    if "subject" in data:
        record.subject = data["subject"]
    if "semester" in data:
        record.semester = data["semester"]

    db.session.commit()
    return jsonify({"message": "File updated", "file": record.to_dict()}), 200


@files_bp.route("/files/<int:file_id>", methods=["DELETE"])
@jwt_required()
def delete_file(file_id):
    user_id = int(get_jwt_identity())
    record = FileItem.query.get_or_404(file_id)

    is_admin = user_id in current_app.config["ADMIN_USER_IDS"]
    if record.uploader_id != user_id and not is_admin:
        return jsonify({"error": "You can only delete your own uploads"}), 403

    if isinstance(record.filename, str) and record.filename.startswith("http"):
        delete_cloudinary_asset(record)
    elif isinstance(record.filename, str):
        file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], record.filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                logger.warning("Local file deletion failed for file %s", record.id, exc_info=True)

    Notification.query.filter_by(file_id=record.id).delete(synchronize_session=False)
    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "File deleted"}), 200