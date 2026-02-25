FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install

COPY server/ .

EXPOSE 5080

CMD ["npx", "json-server", "--watch", "data/db.json", "--port", "5080", "--host", "0.0.0.0"]
