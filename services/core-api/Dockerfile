FROM python:3.6

USER 0

# Update installation utility
RUN apt-get update

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install the requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Setup user to represent developer permissions in container
ARG USERNAME=developer
ARG USER_UID=1000
ARG USER_GID=$USER_UID
RUN useradd -rm -d /home/$USERNAME -s /bin/bash -g root -G sudo -u $USER_UID $USERNAME
USER $USERNAME

# Run the server
EXPOSE 5000
CMD [ "flask", "run"]