from flask import Flask, request, session, jsonify
import os
from werkzeug.utils import secure_filename
from utils.ssh_client_wrapper import ssh_connection, run_command_in_ssh, close_connection
from utils.docker_wrapper import fetch_images_from_docker_hub, get_docker_run_command, get_all_docker_containers_cmd


app = Flask(__name__)
app.secret_key = 'super-secret-key'
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'],exist_ok=True)

ssh_clients = []

@app.route('/', methods=['POST'])
def connect_vm():
    ip = request.form.get('ip')
    port = int(request.form.get('port'))
    pem_file = request.files.get('pem_key')
# add validation for ip, port, and pem_file
    if not all([ip, port, pem_file]):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    
    pem_file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(pem_file.filename))
    pem_file.save(pem_file_path)

    try:
        ssh_client = ssh_connection(ip, port, pem_file_path)
        session_id = session.sid
        #  understand  what needs to be stored in session
        ssh_clients[session_id] = ssh_client 
        session['vm_connected'] = True
        return jsonify({'success': True}), 200
    except Exception as ex:
        return jsonify({'success': False ,'error': f'Connection failed: {str(ex)}'}), 500

@app.route('/search_images', methods=['GET'])
def search_images():
    image_query_str = request.args.get('query')
    # for default AI/ML images we can create a predefined list.
    try:
        if not image_query_str:
            default_images = fetch_images_from_docker_hub()
            return jsonify({'images': default_images}), 200
        else:
            # Fetch images from Docker Hub based on the query string
            images = fetch_images_from_docker_hub(query=image_query_str)
            if not images:
                return jsonify({'images': [], 'error': 'No images found'}), 404
            return jsonify({'images': images}), 200
    except Exception as ex:
        return jsonify({'images': [], 'error': f'Error fetching images: {str(ex)}'}), 500

@app.route('/deploy', methods=['POST'])
def deploy_image():
    is_connected_to_vm = session.get('vm_connected', False)
    if not is_connected_to_vm:
        #retry for session connection
        return jsonify({'success': False, 'error': 'Not connected to VM'}), 400
    
    data = request.json
    image_name = data.get('image_name')
    if not image_name:
        return jsonify({'success': False, 'error': 'Image name is required'}), 400
    tag = data.get('tag', 'latest')
    container_name = data.get('container_name', image_name) # customized name for the container
    ports = data.get('ports', [])
    env_vars = data.get('env_vars', [])
    entrypoint = data.get('entrypoint', None)
    num_of_cpus = data.get('num_of_cpus')
    memory_limit = data.get('memory_limit')
    shm_size = data.get('shm_size')
    runtime = data.get('runtime', 'normal')
    gpus = data.get('gpus', None)
    restart_policy = data.get('restart_policy')
    enable_ipc_host = data.get('enable_ipc_host', False)
    enable_priviliged = data.get('enable_privileged', False)

    ssh_client = session.get('ssh_client')
    if not ssh_client:
        #  we can store ip,port and pem in session and try to reconnect. For now throwing error
        return jsonify({'success': False, 'error': 'SSH client not connected'}), 400

    docker_run_cmd = get_docker_run_command(
        image_name=image_name,
        tag=tag,
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
    is_connected_to_vm = session.get('vm_connected', False)
    if not is_connected_to_vm:
        return jsonify({'success': False, 'error': 'Not connected to VM'}), 400
    
    ssh_client = session.get('ssh_client')
    if not ssh_client:
        return jsonify({'success': False, 'error': 'SSH client not connected'}), 400
    
    try:
        all_docker_containers_cmd = get_all_docker_containers_cmd(ssh_client)
        containers = run_command_in_ssh(ssh_client, all_docker_containers_cmd)
        #need to modify the output format to match the expected JSON structure
        return jsonify({'success': True, 'containers': containers}), 200
    except Exception as ex:
        return jsonify({'success': False, 'error': f'Error fetching containers: {str(ex)}'}), 500
    

# close ssh connection when user close session
