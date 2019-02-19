FROM node:8.15-alpine

WORKDIR /usr/src/kaa/web-thermostat

COPY package.json package-lock.json ./
COPY . ./

RUN npm install --unsafe-perm && npm run build


FROM nginx:1.14-alpine
COPY --from=0 /usr/src/kaa/web-thermostat/build /usr/share/nginx/html

