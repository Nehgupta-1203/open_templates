import paramiko

def ssh_connection(ip,port,username,pem_file_path):
    try:
        ssh_client =paramiko.SSHClient()
        ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        pkey = paramiko.RSAKey.from_private_key_file(pem_file_path)
        ssh_client.connect(ip,port=port,username=username,password="Apple")
        return ssh_client
    except Exception as e:
        raise Exception(f"Failed to connect to {ip}:{port} - {str(e)}")

def is_ssh_connected(ssh_client):
    transport = ssh_client.get_transport()
    return transport is not None and transport.is_active()

def reconnect_ssh_if_needed(ssh_client):
    if not is_ssh_connected(ssh_client):
        try:
            ssh_client.close()
            # Attempt to reconnect using the same parameters
            ssh_client.connect(ssh_client.get_transport().getpeername()[0], port=ssh_client.get_transport().getpeername()[1], pkey=ssh_client.get_transport().get_pkey())
        except Exception as e:
            raise Exception(f"Reconnection failed: {str(e)}")

def run_command_in_ssh(ssh_client, command):
    try:
        reconnect_ssh_if_needed(ssh_client)
        stdin, stdout, stderr = ssh_client.exec_command(command)
        exit_status = stdout.channel.recv_exit_status()  # Wait for command to finish
        if exit_status != 0:
            raise Exception(f"Command failed: {stderr.read().decode()}")
        return stdout.read().decode().strip()  # Return command output
    except Exception as e:
        raise Exception(f"Failed to run command '{command}': {str(e)}")
    
def close_connection(ssh):
    try:
        ssh.close()
    except Exception as e:
        raise Exception(f"Failed to close SSH connection: {str(e)}")
    