FROM node:20.12.2

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY package.json ./

RUN yarn

COPY . .

EXPOSE 3020
CMD [ "yarn", "serve" ]
