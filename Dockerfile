FROM node:22.12-alpine
RUN mkdir -p /home/node/CambridgeAppBackend/node_modules && chown -R node:node /home/node/CambridgeAppBackend
WORKDIR /home/node/CambridgeAppBackend

COPY --chown=node:node package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
EXPOSE 5050
CMD [ "node", "index.js" ]
