import os
import uuid
import logging
import cloudinary
import cloudinary.uploader
from urllib.parse import unquote, urlsplit, urlunsplit
from flask import Blueprint, request, jsonify, send_from_directory, current_app, redirect
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, FileItem, Notification, Follow

files_bp = Blueprint("files", __name__)
logger = logging.getLogger(__name__)


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

        notify_followers(record)

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
    
    # Agar Cloudinary URL hai toh browser ko direct wahan redirect karein
    if record.filename.startswith("http"):
        return redirect(cloudinary_delivery_url(record))
        
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