FROM node:12-alpine

RUN npm install -g elasticsearch-index-migrate@0.6.0

WORKDIR /es

ENTRYPOINT ["elasticsearch-index-migrate"]

CMD ["-?"]
