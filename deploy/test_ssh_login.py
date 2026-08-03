import pty
import os
import sys
import time
import subprocess
import select

master, slave = pty.openpty()
proc = subprocess.Popen(
    ["ssh", "-o", "StrictHostKeyChecking=no", "root@76.13.253.114", "ls -la /var/www/ && echo DATABASES && mariadb -u root -e 'SHOW DATABASES;'"],
    stdin=slave, stdout=slave, stderr=slave, close_fds=True
)

time.sleep(1)
os.write(master, b"Belalalbanna12#@\n")

output = b""
start_time = time.time()
while time.time() - start_time < 10:
    r, _, _ = select.select([master], [], [], 0.5)
    if r:
        try:
            chunk = os.read(master, 4096)
            if not chunk: break
            output += chunk
        except Exception:
            break

print("FULL SSH OUTPUT:\n", output.decode('utf-8', errors='ignore'))
