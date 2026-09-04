from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Comment, FileItem

comments_bp = Blueprint("comments", __name__)


@comments_bp.route("/files/<int:file_id>/comments", methods=["GET"])
def list_comments(file_id):
    FileItem.query.get_or_404(file_id)  # 404 if the file doesn't exist
    results = Comment.query.filter_by(file_id=file_id).order_by(Comment.created_at.asc()).all()
    return jsonify([c.to_dict() for c in results]), 200


@comments_bp.route("/files/<int:file_id>/comments", methods=["POST"])
@jwt_required()
def add_comment(file_id):
    FileItem.query.get_or_404(file_id)
    user_id = int(get_jwt_identity())

    data = request.get_json() or {}
    text = data.get("text")
    if not text or not text.strip():
        return jsonify({"error": "Comment text is required"}), 400

    comment = Comment(text=text.strip(), file_id=file_id, author_id=user_id)  # type: ignore
    db.session.add(comment)
    db.session.commit()

    return jsonify({"message": "Comment added", "comment": comment.to_dict()}), 201


@comments_bp.route("/comments/<int:comment_id>", methods=["DELETE"])
@jwt_required()
def delete_comment(comment_id):
    user_id = int(get_jwt_identity())
    comment = Comment.query.get_or_404(comment_id)

    if comment.author_id != user_id:
        return jsonify({"error": "You can only delete your own comments"}), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify({"message": "Comment deleted"}), 200