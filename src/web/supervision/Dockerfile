FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ARG REACT_APP_API_URL
ARG REACT_APP_SUPERVISION_URL
ARG REACT_APP_AUTH_BYPASS=false
ENV REACT_APP_AUTH_BYPASS=$REACT_APP_AUTH_BYPASS
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
