FROM node:12-alpine

RUN npm install -g elasticsearch-index-migrate@0.3.7

ENTRYPOINT ["elasticsearch-index-migrate"]

CMD ["-?"]
