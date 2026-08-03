import pty
import os
import time

def run_ssh_command(cmd):
    master, slave = pty.openpty()
    proc = os.popen(f"ssh -o StrictHostKeyChecking=no root@76.13.253.114 '{cmd}'", "w")
    # write password via pty if needed
    time.sleep(1)

import subprocess

script = """
set timeout 30
spawn ssh -o StrictHostKeyChecking=no root@76.13.253.114 "ls -la /var/www/ && mariadb -u root -e 'SHOW DATABASES;'"
expect "*password:"
send "Belalalbanna12#@\\r"
expect eof
"""

with open('/tmp/test_ssh.exp', 'w') as f:
    f.write(script)

res = subprocess.run(['expect', '/tmp/test_ssh.exp'], capture_output=True, text=True)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
