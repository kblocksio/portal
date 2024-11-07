FROM node:20

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install dependencies
RUN npm install

COPY apps/server apps/server
COPY packages/shared packages/shared
COPY turbo.json ./
COPY .eslintrc.js ./
COPY .prettierrc.json ./
COPY .npmrc ./

# Expose the port the app runs on
EXPOSE 3001

WORKDIR /usr/src/app/apps/server

ARG ENV=prod
ENV NODE_ENV=$ENV

CMD npm run $NODE_ENV
