FROM node:8-alpine

MAINTAINER FreshWorks <web@freshworks.io>

RUN echo "@edge http://nl.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories
RUN apk update
RUN apk add --no-cache nasm build-base libtool libpng-dev autoconf automake

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
