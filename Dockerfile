FROM quay.io/realeyes/alpine-node-git
ENV PATH="$PATH:/bin/bash:/opt/bento4/bin" \
    BENTO4_BIN="/opt/bento4/bin" \
    BENTO4_BASE_URL="http://zebulon.bok.net/Bento4/source/" \
    BENTO4_VERSION="1-5-1-627" \
    BENTO4_CHECKSUM="bfd302b028694a545c93c4d363dde0e18ba79901" \
    BENTO4_TARGET="" \
    BENTO4_PATH="/opt/bento4" \
    BENTO4_TYPE="SRC"

# Install Bower for build
RUN npm install -g bower --insecure-perms

# Install dependencies and FFMPEG
RUN apk add --update sudo openntpd python unzip bash gcc g++ scons ffmpeg

# docker container time must be up to date
RUN ntpd -dn -p north-america.pool.ntp.org
    
# Install Bento
WORKDIR /tmp/bento4
    # download and check bento4
RUN wget ${BENTO4_BASE_URL}Bento4-${BENTO4_TYPE}-${BENTO4_VERSION}.zip && \
    sha1sum -b Bento4-${BENTO4_TYPE}-${BENTO4_VERSION}${BENTO4_TARGET}.zip | grep -o "^$BENTO4_CHECKSUM "
    # Unzip
RUN mkdir -p ${BENTO4_PATH} && \
    unzip Bento4-${BENTO4_TYPE}-${BENTO4_VERSION}${BENTO4_TARGET}.zip -d ${BENTO4_PATH} && \
    rm -rf Bento4-${BENTO4_TYPE}-${BENTO4_VERSION}${BENTO4_TARGET}.zip && \
    apk del unzip && \
    # don't do these steps if using binary install
    cd ${BENTO4_PATH} && scons -u build_config=Release target=x86_64-unknown-linux && \
    cp -R ${BENTO4_PATH}/Build/Targets/x86_64-unknown-linux/Release ${BENTO4_PATH}/bin && \
    cp -R ${BENTO4_PATH}/Source/Python/utils ${BENTO4_PATH}/utils && \
    cp -a ${BENTO4_PATH}/Source/Python/wrappers/. ${BENTO4_PATH}/bin
