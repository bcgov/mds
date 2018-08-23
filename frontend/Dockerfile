FROM node:8

MAINTAINER FreshWorks <web@freshworks.io>

RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY package*.json /app
RUN npm install

# Add node_modules binary to the path
ENV PATH $PATH:/app/node_modules/.bin

# Copy over source
COPY . /app

# Build the app and remove any non-production dependencies
RUN npm run build

# Run the server
EXPOSE 80
CMD [ "npm", "run", "start" ]
