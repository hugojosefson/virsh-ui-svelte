FROM node:13 as builder

RUN mkdir -p /app
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn --ignore-scripts
COPY rollup.config.js /app/
COPY static /app/static
COPY src /app/src
RUN yarn
RUN yarn build

###############################################################
FROM node:13

RUN mkdir -p /app
WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn --production
COPY static /app/static
COPY --from=builder /app/__sapper__/build/ /app/__sapper__/build/
ENV NODE_ENV production
CMD node __sapper__/build
