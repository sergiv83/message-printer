FROM node:12-alpine

# Create application user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup -u 1001 \
    && mkdir -p /var/app \
    && chown -R appuser:appgroup /var/app

USER appuser
WORKDIR /var/app

# copy package.json
ADD --chown=appuser:appgroup ./package*.json ./

# install dependencies
RUN npm install

# add rest of code
ADD --chown=appuser:appgroup . .

# start command
CMD ["npm", "start"]
