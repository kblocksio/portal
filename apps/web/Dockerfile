FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY ./dist /usr/share/nginx/html
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf
