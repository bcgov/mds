#!/bin/bash
#========================================================================#
# MDS secret check
# Synopsis: script used to scan for a target secret to check if it's in use without using the GUI console
#========================================================================#

TARGET=${1}
S_NAMES=$(oc get secrets -o wide | grep Opaque | awk '{ print $1 }')
for N in $S_NAMES
do
    echo "Checking $N"
    ENC_LIST=$(oc get secret $N -o=jsonpath="{$.data}" | yq e -P - | yq e '.*' -)
    for S in $ENC_LIST
    do
        DEC="$(echo -n $S | base64 -d)"
        # echo "$S vs $DEC"
        if [ "$DEC" = "$TARGET" ];
        then
            echo "**FOUND INSTANCE OF TARGET IN $N**"
        fi
    done
done