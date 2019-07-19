TOKEN_FILE=/var/run/secrets/kubernetes.io/serviceaccount/token
if [ -f $TOKEN_FILE ]; then
    export OC_TOKEN=$(cat $TOKEN_FILE);
fi