"""WSGI compatibility entry point for Render and Gunicorn."""

from app import app

application = app
