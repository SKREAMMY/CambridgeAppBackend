FROM node:22.12-alpine

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

RUN mkdir -p /home/node/CambridgeAppBackend/node_modules && chown -R node:node /home/node/CambridgeAppBackend
WORKDIR /home/node/CambridgeAppBackend



COPY --chown=node:node package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
COPY pythonrequirements.txt ./
RUN pip3 install --no-cache-dir -r pythonrequirements.txt
EXPOSE 5050
CMD [ "node", "index.js" ]
