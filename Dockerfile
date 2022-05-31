FROM node:alpine AS builder
ENV NODE_ENV production
RUN mkdir app
WORKDIR /app
COPY package.json .
COPY tsconfig.json .
COPY src src
COPY public public
RUN yarn install --production
RUN yarn build

FROM nginx:1.21.0-alpine as production
ENV NODE_ENV production
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]