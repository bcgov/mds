FROM node:20

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY package.json ./

RUN npm ci

COPY . .

# Run the server
EXPOSE 3000
CMD [ "npm", "run", "serve" ]
