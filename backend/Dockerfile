# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.8.0
ARG NODE_ENV=development

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=${NODE_ENV}


WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.yarn to speed up subsequent builds.
# Leverage a bind mounts to package.json and yarn.lock to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    if [ "${NODE_ENV}" = "production" ]; then \
        yarn install --production=true --frozen-lockfile; \
    else \
        yarn install --production=false --frozen-lockfile; \
    fi

# Ensure the node user owns the node_modules directory.
RUN chown -R node /usr/src/app/node_modules

# Create the logs directory and make it writable by all users.
RUN mkdir -p /app/logs && chmod 755 /app/logs

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Ensure the correct ownership for the logs directory
# RUN chown -R node /usr/src/app/logs

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD yarn dev



