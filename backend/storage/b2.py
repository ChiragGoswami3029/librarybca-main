"""Reusable Backblaze B2 client using the S3-compatible API."""

from __future__ import annotations

from urllib.parse import urlparse

import boto3
from botocore.config import Config as BotoConfig


class B2Storage:
    """Create an S3 client for Backblaze B2 without changing file routes."""

    def __init__(
        self,
        application_key_id: str,
        application_key: str,
        bucket_name: str,
        endpoint: str,
    ) -> None:
        self.bucket_name = bucket_name
        self.endpoint = self._validate_endpoint(endpoint)
        self._client = boto3.client(
            "s3",
            endpoint_url=self.endpoint,
            aws_access_key_id=application_key_id,
            aws_secret_access_key=application_key,
            config=BotoConfig(
                signature_version="s3v4",
                s3={"addressing_style": "path"},
            ),
        )

    @classmethod
    def from_config(cls, config) -> "B2Storage":
        values = {
            "application_key_id": config.get("B2_APPLICATION_KEY_ID"),
            "application_key": config.get("B2_APPLICATION_KEY"),
            "bucket_name": config.get("B2_BUCKET_NAME"),
            "endpoint": config.get("B2_ENDPOINT"),
        }
        missing = [name for name, value in values.items() if not value]
        if missing:
            raise RuntimeError(
                "Missing Backblaze B2 configuration: " + ", ".join(missing)
            )
        return cls(**values)

    @property
    def client(self):
        """Return the configured boto3 S3 client."""
        return self._client

    def create_presigned_put_url(self, object_key: str, content_type: str) -> str:
        return self.client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": self.bucket_name,
                "Key": object_key,
                "ContentType": content_type,
            },
            ExpiresIn=900,
            HttpMethod="PUT",
        )

    def head_object(self, object_key: str):
        return self.client.head_object(Bucket=self.bucket_name, Key=object_key)

    def delete_object(self, object_key: str) -> None:
        self.client.delete_object(Bucket=self.bucket_name, Key=object_key)

    @staticmethod
    def _validate_endpoint(endpoint: str) -> str:
        parsed = urlparse(endpoint)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("B2_ENDPOINT must be a valid HTTP(S) URL")
        return endpoint.rstrip("/")