# FROM node:22.12-alpine

# # Install Python and pip
# RUN apk add --no-cache python3 py3-pip

# RUN mkdir -p /home/node/CambridgeAppBackend/node_modules && chown -R node:node /home/node/CambridgeAppBackend
# WORKDIR /home/node/CambridgeAppBackend

# # Create a Python virtual environment
# RUN python3 -m venv /usr/src/app/venv
# RUN chown -R node:node /usr/src/app
# COPY pythonrequirements.txt ./
# RUN . /usr/src/app/venv/bin/activate && pip install --no-cache-dir -r pythonrequirements.txt
# COPY --chown=node:node package*.json ./
# USER node
# RUN npm install
# COPY --chown=node:node . .

# EXPOSE 5050
# CMD [ "node", "index.js" ]


# Use a lightweight Node.js image with Alpine Linux
FROM node:22.12-alpine

# Install necessary packages, including Chromium for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    bash

# Create necessary directories and set correct permissions
RUN mkdir -p /home/node/CambridgeAppBackend/node_modules && \
    chown -R node:node /home/node/CambridgeAppBackend

# Set the working directory
WORKDIR /home/node/CambridgeAppBackend

# Create a Python virtual environment
# RUN python3 -m venv /home/node/venv

# Copy and install Python dependencies
# COPY pythonrequirements.txt ./
# RUN . /home/node/venv/bin/activate && pip install --no-cache-dir -r pythonrequirements.txt

# Copy package.json and install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy all application files with correct ownership
COPY --chown=node:node . .

# Set the CHROME_PATH environment variable for Puppeteer
ENV CHROME_PATH=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Switch to the non-root "node" user
USER node

# Expose the application's port
EXPOSE 5050

# Command to run the Node.js application
CMD ["node", "index.js"]