import json
from flask import Flask, request, session, jsonify
import os
from werkzeug.utils import secure_filename
from utils.ssh_client_wrapper import ssh_connection, run_command_in_ssh, reconnect_ssh_if_needed,close_connection
from utils.docker_wrapper import fetch_images_from_docker_hub, get_docker_run_command, fetch_all_docker_containers_cmd, stop_docker_container_cmd, restart_docker_container_cmd
import uuid
from flask_socketio import SocketIO

app = Flask(__name__)
app.secret_key = 'super-secret-key'
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'],exist_ok=True)
socketio = SocketIO(app)

ACTIVE_CONNECTIONS = {}

@app.route('/', methods=['POST'])
def connect_vm():
    ip = request.form.get('ip')
    port = int(request.form.get('port'))
    username = request.form.get('username')
    pem_file = request.files.get('pemKey')
# add validation for ip, port, and pem_file
    if not all([ip, port,username, pem_file]):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    
    pem_file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(pem_file.filename))
    pem_file.save(pem_file_path)

    try:
        ssh_client = ssh_connection(ip, port, username, pem_file_path)
        session_id = str(uuid.uuid4())
        session['id'] = session_id
        ACTIVE_CONNECTIONS[session_id] = ssh_client
        session['vm_connected'] = True
        return jsonify({'success': True, 'error': ''}), 200
    except Exception as ex:
        return jsonify({'success': False ,'error': f'Connection failed: {str(ex)}'}), 500

@app.route('/search_images', methods=['GET'])
def search_images():
    image_query_str = request.args.get('query')
    # for default AI/ML images we can create a predefined list.
    try:
        # Fetch images from Docker Hub based on the query string
        images = fetch_images_from_docker_hub(query=image_query_str)
        if not images:
            return jsonify({'images': [], 'error': 'No images found'}), 404
        return jsonify({'images': images}), 200
    except Exception as ex:
        return jsonify({'images': [], 'error': f'Error fetching images: {str(ex)}'}), 500

@app.route('/deploy', methods=['POST'])
def deploy_image():
    verify_vm_is_connected()
    data = request.get_json()
    image_name =  data.get('image')
    docker_options = data.get('dockerOptions')
    if not image_name:
        return jsonify({'success': False, 'error': 'Image name is required'}), 400
    tag = docker_options.get('tag', None)
    container_name = docker_options.get('containerName', None) # customized name for the container
    ports_str = docker_options.get('ports')
    if not ports_str in (""):
        ports = ports_str.split(',')
    else: ports = []
    volumes = docker_options.get('volumes',None)
    env_vars_str = docker_options.get('envVars', [])
    if not env_vars_str in (""):
        env_vars = env_vars.split(',')
    else: env_vars = []
    entrypoint = docker_options.get('entrypoint', None)
    num_of_cpus = docker_options.get('num_of_cpus', None)
    memory_limit = docker_options.get('memory_limit', None)
    shm_size = docker_options.get('shm_size', None)
    runtime = docker_options.get('runtime', None)
    gpus = docker_options.get('gpus', None)
    restart_policy = docker_options.get('restart_policy',None)
    enable_ipc_host = docker_options.get('enable_ipc_host', False)
    enable_priviliged = docker_options.get('enable_privileged', False)

    ssh_client = get_ssh_client()

    docker_run_cmd = get_docker_run_command(
        image_name=image_name,
        tag= tag,
        volumes=volumes,
        container_name=container_name,
        ports=ports,
        env_vars=env_vars,
        entrypoint=entrypoint,
        num_of_cpus=num_of_cpus,
        memory_limit=memory_limit,
        shm_size=shm_size,
        runtime=runtime,
        gpus=gpus,
        restart_policy=restart_policy,
        enable_ipc_host=enable_ipc_host,
        enable_priviliged=enable_priviliged
    )
    
    try:
        run_command_in_ssh(ssh_client, docker_run_cmd)
        return jsonify({'success': True, 'message': f'Container {container_name} deployed successfully'}), 200
    except Exception as ex:
        return jsonify({'success': False, 'error': f'Error deploying container: {str(ex)}'}), 500

  
@app.route('/container_dashboard', methods=['GET'])
def container_dashboard():
    verify_vm_is_connected()
    try:
        ssh_client = get_ssh_client()
        all_docker_containers_cmd = fetch_all_docker_containers_cmd()
        fetch_all_containers = run_command_in_ssh(ssh_client, all_docker_containers_cmd)
       
        containers_data = fetch_all_containers.split('\n')
        filters_container_data = map(filter_container_data, containers_data)

        return jsonify({'containers': list(filters_container_data)}), 200
    except Exception as ex:
        return jsonify({'containers': [], 'error': f'Error fetching containers: {str(ex)}'}), 500

def filter_container_data(container_data):
    container_data_in_json = json.loads(container_data)
    return {
        'id': container_data_in_json['ID'],
        'image': container_data_in_json['Image'],
        'status': container_data_in_json['Status']
    }

@app.route('/stop_container', methods=['POST'])
def stop_container():
    verify_vm_is_connected()
    container_id = request.json.get('container_id')
    if not container_id:
        return jsonify({'success': False, 'error': 'Container ID is required'}), 400
    try:
        ssh_client = get_ssh_client()
        stop_container_cmd = stop_docker_container_cmd(container_id)
        run_command_in_ssh(ssh_client, stop_container_cmd)
        return jsonify({'success': True}), 200
    except Exception as ex:
        return jsonify({'success': False, 'error': f'Error stopping container: {str(ex)}'}), 500
    
@app.route('/restart_container', methods=['POST'])
def restart_container():
    verify_vm_is_connected()
    container_id = request.json.get('container_id')
    if not container_id:
        return jsonify({'success': False, 'error': 'Container ID is required'}), 400
    try:
        ssh_client = get_ssh_client()
        restart_container_cmd = restart_docker_container_cmd(container_id)
        run_command_in_ssh(ssh_client, restart_container_cmd)
        return jsonify({'success': True}), 200
    except Exception as ex:
        return jsonify({'success': False, 'error': f'Error restarting container: {str(ex)}'}), 500

@socketio.on('disconnect')
def handle_disconnect():
    session_id = session.get('id')
    ssh_client = ACTIVE_CONNECTIONS.pop(session_id, None)
    if ssh_client:
        close_connection(ssh_client)
    session.clear()

def verify_vm_is_connected():
    is_connected_to_vm = session.get('vm_connected', False)
    if not is_connected_to_vm:
        try:
            reconnect_ssh_if_needed(ACTIVE_CONNECTIONS['session_id'])
        #    update session here and ssh_client

            session['vm_connected'] = True
        except Exception as ex:
            return jsonify({'success': False, 'error': 'Not connected to VM'}), 400


def get_ssh_client():
    id = session.get('id')
    return ACTIVE_CONNECTIONS[id]
