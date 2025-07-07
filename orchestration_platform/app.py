from flask import Flask, request, render_template, redirect, url_for, session
import paramiko
import requests
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'super-secret-key'
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'],exist_ok=True)

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
    if request.method == 'POST':
        ip = request.form['ip']
        port = int(request.form['port'])
        # pem = request.files['pem']
        # pem_file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(pem.filename))
        # pem.save(pem_file_path)

        try:
            # ssh = ssh_client(ip, port, pem_file_path)
            # ssh.close()
            session['ip'] = ip
            session['port'] = port
            # session['pem_file_path'] = pem_file_path
            show_deploy = True
            docker_images = fetch_images_from_docker_hub()

        except Exception as ex:
            return f"Connection failed: {str(ex)}"
        
    return render_template('index.html', show_deploy=show_deploy, templates=docker_images)

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

    


