FROM node:12-alpine

RUN mkdir -p /opt && mkdir -p /opt/http

ADD . /opt/http

WORKDIR /opt/http

RUN npm install && npm run client:build

CMD ["node", "./server/index.js"]
