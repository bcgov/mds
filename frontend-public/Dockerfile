FROM node:8

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY . /app/

RUN npm ci

# Build the app and remove any non-production dependencies
RUN npm run build

# Run the server
EXPOSE 3020
CMD [ "npm", "run", "start" ]
