FROM node:10

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Build the app and remove any non-production dependencies
RUN npm run build

# Run the server
EXPOSE 3000
CMD [ "npm", "run", "start" ]
