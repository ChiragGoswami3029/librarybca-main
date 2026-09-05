from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = (data.get("name") or "").strip()
    email = ((data.get("email") or "").strip()).lower()
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "name, email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(name=name, email=email)     #type: ignore
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Account created. You can now log in."}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = ((data.get("email") or "").strip()).lower()
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Create a token — like a library card the frontend keeps and shows for future requests
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "name": user.name}), 200

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
        "is_admin": user.id in current_app.config["ADMIN_USER_IDS"],
    }), 200