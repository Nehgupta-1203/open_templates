from flask import Flask, request, render_template, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from models import db, Deployment
import paramiko
import requests
import os
from werkzeug.utils import secure_filename


app = Flask(__name__)
app.secret_key = 'super-secret-key'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@localhost:5432/orchestration_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
os.makedirs(app.config['UPLOAD_FOLDER'],exist_ok=True)
db.init_app(app)

def ssh_client(ip,port,pem_file_path):
    ssh =paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    pkey = paramiko.RSAKey.from_private_key_file(pem_file_path)
    ssh.connect(ip,port=port,pkey=pkey)
    return ssh

@app.route('/',methods=['GET','POST'])
def index():
    show_deploy = False
    docker_images = []
    dashboard_data = []
    if request.method == 'POST':
        # If this is the VM credentials form
        if 'ip' in request.form and 'port' in request.form and 'pem' in request.files:
            ip = request.form['ip']
            port = int(request.form['port'])
            pem = request.files['pem']
            pem_file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(pem.filename))
            pem.save(pem_file_path)

            try:
                ssh = ssh_client(ip, port, pem_file_path)
                ssh.close()
                show_deploy = True
                docker_images = fetch_images_from_docker_hub()
                session['ipv4'] = ip
                # Fetch dashboard data for this user
                dashboard_data = Deployment.query.filter_by(ipv4=ip).order_by(Deployment.timestamp.desc()).all()
            except Exception as ex:
                return f"Connection failed: {str(ex)}"
        # If this is the deploy form
        elif 'image' in request.form:
            repo_name = request.form['image']
            ipv4 = session.get('ipv4')
            if ipv4 and repo_name:
                deployment = Deployment(ipv4=ipv4, repo_name=repo_name)
                db.session.add(deployment)
                db.session.commit()
                # Refresh dashboard data after new deployment
                dashboard_data = Deployment.query.filter_by(ipv4=ipv4).order_by(Deployment.timestamp.desc()).all()
            show_deploy = True
            docker_images = fetch_images_from_docker_hub()
    return render_template('index.html', show_deploy=show_deploy, templates=docker_images, dashboard_data=dashboard_data)

def fetch_images_from_docker_hub(query="machine_learning",page_size=10):
    url = f"https://hub.docker.com/v2/search/repositories/?query={query}&page_size={page_size}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return [{
                'repo_name': item['repo_name'],
                'description': item.get('description', ''),
                'pull_count': item.get('pull_count', 0),
                'star_count': item.get('star_count', 0)
            }
            for item in data['results']
            ]
    except Exception as ex:
        print("Error fetching docker images", ex)
    return []

    


