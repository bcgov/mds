FROM python:3.6

WORKDIR /app

# Update installation utility
RUN apt-get update

# Install the requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Fix log path permissions
# This is a bit hacky but other fixes require changing app code
RUN mkdir -p /var/log/core-api
RUN chmod -R 700 /var/log
RUN chown -R 1000:0 /var/log

# Setup user to represent developer permissions in container
ARG USERNAME=python
ARG USER_UID=1000
ARG USER_GID=1000
RUN useradd -rm -d /home/$USERNAME -s /bin/bash -g root -G sudo -u $USER_UID $USERNAME
USER $USERNAME

RUN mkdir -p /tmp/celery


# Run the server
EXPOSE 5000
CMD ["flask", "run"]