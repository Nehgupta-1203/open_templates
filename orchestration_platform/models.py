from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Deployment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ipv4 = db.Column(db.String(64), nullable=False)
    repo_name = db.Column(db.String(256), nullable=False)
    description = db.Column(db.Text, nullable=True)
    star_count = db.Column(db.Integer, nullable=True)
    pull_count = db.Column(db.Integer, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
