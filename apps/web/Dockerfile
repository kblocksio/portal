FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY ./dist /usr/share/nginx/html
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf

# # Add healthcheck
# HEALTHCHECK --interval=30s --timeout=3s \
#     CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# # Expose port
# EXPOSE 80
