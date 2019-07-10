#!/bin/bash

# Override the default command for the dockerfile
# To create local user and assign permissions to it.

export PATH="/opt/jboss/keycloak/bin:$PATH"

kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user admin --password admin
USER_ID=`kcadm.sh create users -r mds -s username=admin -i`
kcadm.sh update users/$USER_ID -r mds -s enabled=true
kcadm.sh set-password -r mds --username admin --new-password admin
kcadm.sh add-roles -r mds --uusername admin --rolename mds_application_admins --rolename mds-mine-admin