import requests
from flask import jsonify


def fetch_images_from_docker_hub(query="machine_learning",page_size=10):
    url = f"https://hub.docker.com/v2/search/repositories/?query={query}&page_size={page_size}"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()  
        data = response.json()
        images = [{
            'repo_name': item['repo_name'],
            'description': item.get('description', ''),
            'pull_count': item.get('pull_count', 0),
            'star_count': item.get('star_count', 0)
        }
        for item in data['results']
        ]
        return jsonify({'images': images}), 200
    except Exception as ex:
        return jsonify({'images': [], 'error': f'Error fetching images: {str(ex)}'}), 500
    
def get_docker_run_command(image_name, tag='latest', container_name=None, ports=None, env_vars=None,
                           entrypoint=None, num_of_cpus=None, memory_limit=None, shm_size=None,runtime='normal',
                           gpus=None, restart_policy=None, enable_ipc_host=False, enable_priviliged=False):
    docker_run_cmd = ['docker', 'run', '-d']
    if container_name:
        docker_run_cmd += ['--name', container_name]
    for port in ports:
        docker_run_cmd += ['-p', port]
    for env_var in env_vars:
        docker_run_cmd += ['--env', env_var]
    if num_of_cpus:
        docker_run_cmd += ['--cpus', str(num_of_cpus)]
    if memory_limit:
        docker_run_cmd += ['--memory', memory_limit]
    if shm_size:
        docker_run_cmd += ['--shm-size', shm_size]
    if runtime == 'nvidia':
        docker_run_cmd += ['--runtime', 'nvidia']
        if gpus:
            docker_run_cmd += ['--gpus', str(gpus)]
    if entrypoint:
        docker_run_cmd += ['--entrypoint', entrypoint]
    if restart_policy:
        docker_run_cmd += ['--restart', restart_policy]
    if enable_ipc_host:
        docker_run_cmd += ['--ipc=host']
    if enable_priviliged:
        docker_run_cmd += ['--privileged']

    docker_run_cmd += [f"{image_name}:{tag}"] 
    return ' '.join(docker_run_cmd)

def get_all_docker_containers_cmd():
   return"docker ps -a --format '{{.ID}}: {{.Image}}: {{.Status}}'"