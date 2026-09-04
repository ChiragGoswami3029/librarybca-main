from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Follow, Notification

follow_bp = Blueprint("follow", __name__)


@follow_bp.route("/subjects/<subject>/follow", methods=["POST"])
@jwt_required()
def follow_subject(subject):
    user_id = int(get_jwt_identity())

    existing = Follow.query.filter_by(user_id=user_id, subject=subject).first()
    if existing:
        return jsonify({"message": "Already following"}), 200

    f = Follow(user_id=user_id, subject=subject)  # type: ignore
    db.session.add(f)
    db.session.commit()
    return jsonify({"message": f"Now following {subject}"}), 201


@follow_bp.route("/subjects/<subject>/follow", methods=["DELETE"])
@jwt_required()
def unfollow_subject(subject):
    user_id = int(get_jwt_identity())
    f = Follow.query.filter_by(user_id=user_id, subject=subject).first()
    if f:
        db.session.delete(f)
        db.session.commit()
    return jsonify({"message": f"Unfollowed {subject}"}), 200


@follow_bp.route("/my-follows", methods=["GET"])
@jwt_required()
def my_follows():
    user_id = int(get_jwt_identity())
    results = Follow.query.filter_by(user_id=user_id).all()
    return jsonify([f.subject for f in results]), 200


@follow_bp.route("/notifications", methods=["GET"])
@jwt_required()
def list_notifications():
    user_id = int(get_jwt_identity())
    results = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in results]), 200


@follow_bp.route("/notifications/<int:notification_id>/read", methods=["PATCH"])
@jwt_required()
def mark_read(notification_id):
    user_id = int(get_jwt_identity())
    note = Notification.query.get_or_404(notification_id)
    if note.user_id != user_id:
        return jsonify({"error": "Not your notification"}), 403
    note.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"}), 200