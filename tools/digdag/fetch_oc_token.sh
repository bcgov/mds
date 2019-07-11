$FILE=/var/run/secrets/kubernetes.io/serviceaccount/token
if test -f "$FILE"; then
    export OC_TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
fi
