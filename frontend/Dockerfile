
# Stage 1 - build React App first
# latest @ Jan 2022
FROM node:16-alpine3.14 as build

LABEL version="1.1"
LABEL description="SGDecoding Frontend"
LABEL maintainer=["helpdesk@abax.ai"]

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY ["package.json", "package-lock.json", "./"]

RUN npm ci

COPY . /app

RUN npm run build


# Stage 2 - set up nginx and copy production /build over 
FROM nginx:1.21.5-alpine

COPY --from=build /app/build /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]