FROM node:10 AS frontend

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

FROM frontend AS test
RUN npm run test

# Run the server
FROM frontend as runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]
