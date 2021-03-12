# base image
FROM node:10 as build-deps

# set working directory
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@3.4.1 -g --silent
COPY . ./
RUN npm run build

FROM nginx:1.19-alpine
COPY --from=build-deps /app/build /usr/share/nginx/html
COPY --from=build-deps /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["sh", "-c", "envsubst < /usr/share/nginx/html/public/env.template.js > /usr/share/nginx/html/public/env.js && exec nginx -g 'daemon off;'"]
