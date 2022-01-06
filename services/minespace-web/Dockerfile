FROM node:14.8.0

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Setup user to represent developer permissions in container
ARG USERNAME=developer
ARG USER_UID=1000
ARG USER_GID=$USER_UID
RUN useradd -rm -d /home/$USERNAME -s /bin/bash -g root -G sudo -u $USER_UID $USERNAME
USER $USERNAME

# Run the server
EXPOSE 3020
CMD [ "npm", "run", "serve" ]
