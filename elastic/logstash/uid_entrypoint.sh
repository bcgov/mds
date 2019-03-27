# Ensure that assigned uid has entry in /etc/passwd.
cat /etc/passwd | sed -e "s/^$NB_USER:/builder:/" > /tmp/passwd
echo "$NB_USER:x:`id -u`:`id -g`:,,,:/home/$NB_USER:/bin/bash" >> /tmp/passwd
cat /tmp/passwd > /etc/passwd
rm /tmp/passwd

exec logstash "$@"