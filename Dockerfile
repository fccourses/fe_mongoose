FROM node:lts-alpine3.10

RUN mkdir /server

WORKDIR /server

COPY . .

RUN npm i

EXPOSE 3000

CMD npm start