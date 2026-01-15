FROM toluaina1/pgsync:7.0.5

USER root
WORKDIR /app

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
RUN chmod 777 /app

# Switch back to default user if needed, but for now root is fine or we can check who the default user was.
# Usually it's better to run as non-root, but for fixing permissions root is needed.
# Let's assume we can run as root or switch back to 'pgsync' user if we knew it.
# For now, let's leave it as root to avoid permission issues, or check the base image user.
# But wait, if I run as root, I might create files owned by root that pgsync (if it drops privs) can't read.
# However, pgsync is a python script.

ENTRYPOINT ["/app/start.sh"]
