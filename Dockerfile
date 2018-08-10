
FROM node:9.7.1

RUN mkdir -p /yaba/client
WORKDIR /yaba/client

COPY yarn.lock /yaba/client/yarn.lock
COPY package.json /yaba/client/package.json

ENV NODE_PATH /node_modules
ENV PATH $PATH:/node_modules/.bin
RUN yarn

COPY . /yaba/client
