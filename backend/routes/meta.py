from flask import Blueprint, jsonify, current_app

meta_bp = Blueprint("meta", __name__)


@meta_bp.route("/meta", methods=["GET"])
def get_meta():
    # Frontend calls this once to build its dropdowns (Category, Subject, Semester)
    return jsonify({
        "categories": current_app.config["CATEGORIES"],
        "subjects": current_app.config["SUBJECTS"],
        "semesters": current_app.config["SEMESTERS"],
    }), 200