FROM node:slim

WORKDIR /app

ADD package.json /app
RUN npm install
ADD . /app
RUN chmod +x wait-for-it.sh

CMD [ "node", "." ]
