FROM node:14.17.4 AS builder

WORKDIR /app

COPY . .

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

ARG PORT
ENV PORT=${PORT}

ARG REACT_APP_API
ENV REACT_APP_API=$REACT_APP_API

ARG REACT_APP_GIT_SHA
ENV REACT_APP_GIT_SHA=$REACT_APP_GIT_SHA

ARG REACT_APP_BUILD_DATE
ENV REACT_APP_BUILD_DATE=$REACT_APP_BUILD_DATE

RUN npm install --no-optional

RUN npm run build

# Stage 2
FROM nginx:1.21.1-alpine
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/site.conf /etc/nginx/sites-enabled/site.conf
COPY --from=builder /app/build /var/www

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
