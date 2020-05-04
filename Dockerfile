FROM node:14 as builder

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
FROM node:14
LABEL maintainer="Hugo Josefson <hugo.josefson@jayway.com> (https://www.hugojosefson.com/)"

## Use tini for PID 1 to handle process signals correctly, and support graceful shutdown.
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /
RUN chmod +rx /tini
ENTRYPOINT ["/tini", "--"]

RUN mkdir -p /app
WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn --production
COPY static /app/static
COPY --from=builder /app/__sapper__/build/ /app/__sapper__/build/
ENV NODE_ENV production
CMD node __sapper__/build
