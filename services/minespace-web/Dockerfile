FROM node:14.21.3

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json ./

RUN yarn

COPY . .

EXPOSE 3020
CMD [ "yarn", "serve" ]
