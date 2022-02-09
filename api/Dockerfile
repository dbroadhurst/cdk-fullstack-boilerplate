# Stage 1 - transpile typescript into javascript and create static folder with seed data
FROM node:16.13.2 AS builder

WORKDIR /app

COPY . .

RUN npm install && npm run build 

# Stage 2 - build a production version (without devDependancies) of the node modules
FROM node:16.13.2

WORKDIR /app

COPY --from=builder app/dist dist
COPY --from=builder app/package.json package.json
COPY --from=builder app/package-lock.json package-lock.json
RUN npm --production=true install

EXPOSE 8000

ENTRYPOINT [ "node", "dist/main.js" ]