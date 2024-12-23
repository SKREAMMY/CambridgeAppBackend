FROM node:22.12-alpine

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

RUN mkdir -p /home/node/CambridgeAppBackend/node_modules && chown -R node:node /home/node/CambridgeAppBackend
WORKDIR /home/node/CambridgeAppBackend

# Create a Python virtual environment
RUN python3 -m venv /usr/src/app/venv
RUN chown -R node:node /usr/src/app
COPY --chown=node:node package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
COPY pythonrequirements.txt ./
RUN . /usr/src/app/venv/bin/activate && pip install --no-cache-dir -r pythonrequirements.txt
EXPOSE 5050
CMD [ "node", "index.js" ]
