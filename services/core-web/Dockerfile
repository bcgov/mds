FROM node:14.21.3

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Run the server
EXPOSE 3000
CMD [ "npm", "run", "serve" ]
