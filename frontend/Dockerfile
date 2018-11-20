FROM node:8-slim

MAINTAINER FreshWorks <web@freshworks.io>

RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY . /app/
RUN rm -rf node_modules

RUN npm install --silent

# Build the app and remove any non-production dependencies
RUN npm run build

# Run the server
EXPOSE 3000
CMD [ "npm", "run", "start" ]
