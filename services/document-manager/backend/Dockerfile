FROM python:3.11.4

# Update installation utility
RUN apt-get update


# Create working directory
RUN mkdir /app
WORKDIR /app

# Fix log path permissions
RUN mkdir -p /var/log/document-manager
RUN chmod -R 700 /var/log
RUN chown -R 1000:0 /var/log

# Setup user to represent developer permissions in container
ARG USERNAME=python
ARG USER_UID=1000
ARG USER_GID=1000
RUN useradd -rm -d /home/$USERNAME -s /bin/bash -g root -G sudo -u $USER_UID $USERNAME
USER $USERNAME

# Install the requirements
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Run the server
EXPOSE 5001

RUN mkdir -p /tmp/celery

ENTRYPOINT [ "./init.sh" ]