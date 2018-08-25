
FROM node:9.7.1

RUN mkdir -p /yaba-react-client
WORKDIR /yaba-react-client

COPY yarn.lock /yaba-react-client/yarn.lock
COPY package.json /yaba-react-client/package.json

ENV NODE_PATH /node_modules
ENV PATH $PATH:/node_modules/.bin
RUN yarn

COPY . /yaba-react-client
