import os
from dotenv import load_dotenv

# Base folder of this project
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Load environment variables from .env file
load_dotenv(os.path.join(BASE_DIR, '.env'))

class Config:
    # Read Neon Postgres connection string from .env
    _database_url = os.environ.get("DATABASE_URL")
    if _database_url and _database_url.startswith("postgres://"):
        _database_url = _database_url.replace("postgres://", "postgresql://", 1)

    # Use Neon Postgres if available, otherwise fall back to local SQLite
    SQLALCHEMY_DATABASE_URI = _database_url or ("sqlite:///" + os.path.join(BASE_DIR, "database.db"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # 👇 YAHAN IS LINE KO ADD KAREIN
    SEMESTERS = ["1", "2", "3", "4", "5", "6"]

    # Secret key used to sign login tokens (JWT).
    JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]
    ADMIN_USER_IDS = {
        int(user_id.strip())
        for user_id in os.environ.get("ADMIN_USER_IDS", "").split(",")
        if user_id.strip().isdigit()
    }

    JWT_ACCESS_TOKEN_EXPIRES = False # stay logged in until you log out

    # Where uploaded assignment files are physically stored
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

    # Only these file types can be uploaded (safety)
    ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "ppt", "pptx", "png", "jpg", "jpeg", "zip", "txt"}

    CATEGORIES = ["Notes", "Assignments", "Important Questions", "Previous Year Papers"]

    # Edit this list to match actual BCA subjects
    SUBJECTS = [
        "Digital System",
       "Data Structures",
       "Multimedia Technology",
       "Mathematics for Data Science",
       "Intellectual Property Rights",
       "Design and Thinking",    ]