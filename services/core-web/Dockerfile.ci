FROM node:14.8.0

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run-script build

CMD ["node", "server.js" ]