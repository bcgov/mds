# #!/bin/bash

# for file in ${NGINX_CONFIGURATION_PATH}/*
# do
#   filename=$(basename $file)
#   envsubst < $file > /tmp/$filename
#   mv /tmp/$filename $file
# done

# for file in ${NGINX_DEFAULT_CONF_PATH}/*
# do
#   filename=$(basename $file)
#   envsubst < $file > /tmp/$filename
#   mv /tmp/$filename $file
# done

# rm -rf /tmp/*