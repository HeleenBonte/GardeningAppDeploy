FROM node:22-alpine

# use the node user's home so files are already writable by the non-root user
WORKDIR /home/node/app

# copy package files first to leverage layer caching
COPY package*.json ./

# install dependencies as root to avoid permission issues in build environments
RUN npm ci --silent --no-audit --unsafe-perm

# copy remaining files and fix ownership, then switch to non-root user
COPY . .
# (removed chown for faster builds during classroom demo)
# run as non-root for runtime convenience; if permissions issues occur, run as root or re-add chown
USER node

# run as non-root (node) and align port with docker-compose for the frontend
EXPOSE 3000

CMD ["npm", "run", "web"]