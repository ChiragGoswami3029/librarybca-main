from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # A user can upload many files, write many comments, follow many subjects
    files = db.relationship("FileItem", backref="uploader", lazy=True)
    comments = db.relationship("Comment", backref="author", lazy=True)
    follows = db.relationship("Follow", backref="user", lazy=True)

    def set_password(self, password):
        # Never store raw passwords — store a scrambled (hashed) version
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)  # type: ignore


class FileItem(db.Model):
    __tablename__ = "files"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(30), nullable=False)  # Notes, Assignments, Important Questions, Previous Year Papers
    subject = db.Column(db.String(100), nullable=False)
    semester = db.Column(db.String(20), nullable=False)
    filename = db.Column(db.String(255), nullable=False)   # name of file saved on disk
    original_name = db.Column(db.String(255), nullable=False)  # name student sees
    uploader_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    comments = db.relationship("Comment", backref="file", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        # Converts a database row into a plain dictionary (for sending as JSON)
        return {
            "id": self.id,
            "title": self.title,
            "category": self.category,
            "subject": self.subject,
            "semester": self.semester,
            "original_name": self.original_name,
            "uploader": self.uploader.name,  # type: ignore
            "uploader_id": self.uploader_id,
            "upload_date": self.upload_date.isoformat()  ,
            "comment_count": len(self.comments)  # type: ignore[reportArgumentType]
        }


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(1000), nullable=False)
    file_id = db.Column(db.Integer, db.ForeignKey("files.id"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "file_id": self.file_id,
            "author": self.author.name,  # type: ignore
            "author_id": self.author_id,
            "created_at": self.created_at.isoformat() ,  # type: ignore
        }


class Follow(db.Model):
    # A user "follows" a subject to get notified when new files are uploaded to it
    __tablename__ = "follows"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    subject = db.Column(db.String(100), nullable=False)

    __table_args__ = (db.UniqueConstraint("user_id", "subject", name="unique_user_subject"),)


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    file_id = db.Column(db.Integer, db.ForeignKey("files.id"), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "file_id": self.file_id,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() ,  # type: ignore
        }