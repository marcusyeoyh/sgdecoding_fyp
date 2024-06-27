FROM node:16-alpine3.14 

LABEL version="1.1"
LABEL description="viva la vida"
LABEL maintainer=["htan116@e.ntu.edu.sg"]

WORKDIR /usr/src/app/server
ENV PATH /app/node_modules/.bin:$PATH
COPY package-lock.json .
COPY package.json .

RUN npm ci

EXPOSE 2000 8080 8081

COPY . .

CMD ["node", "server.js", "curl", "mongodb-app:27017"]
