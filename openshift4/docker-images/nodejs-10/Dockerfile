FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

# Copy project dependencies
COPY package.json ${APP_ROOT}/src
COPY package-lock.json ${APP_ROOT}/src

# Install dependencies
RUN cd ${APP_ROOT}/src && npm set progress=false && npm ci
