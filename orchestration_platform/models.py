from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class deployed_container_registry(db.Model):
    id = db.Column(db.String(255), primary_key=True)
    user_ipv4_address = db.Column(db.String(64), nullable=False)
    repo_name = db.Column(db.String(256), nullable=False)
    container_status = db.Column(db.String(64), nullable=True)
    # description = db.Column(db.Text, nullable=True)
    # star_count = db.Column(db.Integer, nullable=True)
    # pull_count = db.Column(db.Integer, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
