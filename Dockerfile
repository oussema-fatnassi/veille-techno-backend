ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS install

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm ci --silent

FROM install AS build

COPY --chown=node:node tsconfig*.json ./
COPY --chown=node:node src ./src

RUN npm run build

RUN npm ci --production && npm cache clean --force

FROM node:${NODE_VERSION}-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

RUN rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/bin/npm \
           /usr/local/bin/npx \
           /usr/local/bin/yarn \
           /usr/local/bin/yarnpkg

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

EXPOSE 3000

STOPSIGNAL SIGTERM

CMD ["node", "dist/main"]