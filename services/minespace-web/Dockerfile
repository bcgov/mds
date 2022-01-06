FROM node:14.8.0

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Run the server
EXPOSE 3020
CMD [ "npm", "run", "serve" ]
