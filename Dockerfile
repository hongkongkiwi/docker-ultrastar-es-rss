FROM node:13-stretch

VOLUME "/output"

COPY ./ /app

WORKDIR "/app"

RUN npm install .

CMD ["node", "index.js", "/output/output.rss"]
