FROM node:22.12-alpine

# Install necessary dependencies for Puppeteer and Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    libstdc++ \
    wqy-zenhei

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN mkdir -p /home/node/CambridgeAppBackend/node_modules && chown -R node:node /home/node/CambridgeAppBackend
WORKDIR /home/node/CambridgeAppBackend

COPY --chown=node:node package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
EXPOSE 5050
CMD [ "node", "index.js" ]
