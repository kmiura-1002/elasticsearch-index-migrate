FROM node:12-alpine

RUN npm install -g elasticsearch-index-migrate@0.8.2

WORKDIR /es

ENTRYPOINT ["elasticsearch-index-migrate"]

CMD ["-?"]
