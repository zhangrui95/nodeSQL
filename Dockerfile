FROM keymetrics/pm2:latest-alpine

WORKDIR /opt/hylink/slk-message

# Bundle APP files
COPY common.js .
COPY server.js .
COPY pg-api.js .
COPY package.json .
COPY pm2.json .
COPY httpy.py .
COPY slk-api slk-api/
COPY slk-admin slk-admin/
COPY tools tools/
COPY test test/
COPY schema schema/

# Replace repositories
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories

RUN apk add --update \
    python \
    python-dev \
    py-pip \
    build-base \
    && rm -rf /var/cache/apk/*

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

#RUN npm install anywhere -g

# Show current folder structure in logs
RUN ls -al -R

CMD [ "pm2-runtime", "start", "pm2.json" ]

