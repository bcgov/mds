FROM node:8

MAINTAINER FreshWorks <web@freshworks.io>

RUN apt-get update
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY . /app
RUN rm -rf node_modules package-lock.json
RUN npm install --silent

# Add node_modules binary to the path
ENV PATH $PATH:/app/node_modules/.bin

# Run the server
EXPOSE 3000
CMD [ "npm", "run", "serve" ]
