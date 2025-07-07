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
            return redirect(url_for('deploy'))
        except Exception as ex:
            return f"Connection failed: {str(ex)}"
        
    return render_template('index.html')

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

@app.route('/deploy',methods=['GET','POST'])
def deploy():
    # if 'ip' not in session:
    #     return redirect(url_for('index'))
    docker_images = fetch_images_from_docker_hub()
    if request.method == 'POST':
        template = request.form['template']
        container_port = request.form['container_port']
        
        ip = session['ip']
        port = session['port']
        # pem_file_path = session['pem_file_path']

        try:
            # ssh = ssh_client(ip,port, pem_file_path)
            # docker_run_cmd =f"docker run-d -p {container_port}:{container_port} {template}"
            # stdin, stdout, stderr = ssh.exec_command(docker_run_cmd)
            # ssh.close()
            return redirect(url_for('dashboard'))
        except Exception as ex:
            return f"Failed to run contaner: {str(ex)}"
        
    return render_template('deploy.html', templates=docker_images)

@app.route('/dashboard')
def dashboard():
    if 'ip' not in session:
        return redirect(url_for('index'))
    ip = session['ip']
    port_ssh = session['port']
    pem_file_path = session['pem_file_path']

    try:
        ssh = ssh_client(ip,port_ssh, pem_file_path)
        docker_ps = "docker ps --format "
        stdin, stdout, stderr = ssh.exec_command(docker_ps)
        output = stdout.read().decode()
        ssh.close()
        return render_template('dashboard.html',output=output)
    except Exception as ex:
        return f"Failed to retrieve running containers: {str(ex)}"

    


