FROM quay.io/realeyes/debian-node-bento-ffmpeg as builder

# File system config
WORKDIR /opt/encoder
RUN mkdir -p /hls && mkdir -p /outputs

# Install Bower for build
RUN npm install -g bower --insecure-perms

# Pull in project and build
COPY . .

RUN npm install
RUN bower install --allow-root
RUN npm run compile

# Replace build config
RUN rm -f ./dist/config/config.js && mv ./config/hotconfig.js ./dist/config/config.js
RUN rm -f node_modules/fluent-bento4/src/commands/command.js && mv ./config/fluent-fix.js node_modules/fluent-bento4/src/commands/command.js

EXPOSE 3000 3001

CMD ["pm2-runtime", "/opt/encoder/config/ecosystem.config.js", "--web", "3001"]