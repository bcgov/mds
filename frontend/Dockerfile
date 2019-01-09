FROM node:8

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY . /app/
RUN rm -rf node_modules

RUN npm ci

# Build the app and remove any non-production dependencies
RUN npm run build

# Run the server
EXPOSE 3000
CMD [ "npm", "run", "start" ]
