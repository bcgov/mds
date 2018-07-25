oc process -f _jenkins-config-0.json -l app=jenkins | oc apply -f - -n empr-mds-tools
oc process -f _jenkins-config-1.json -l app=jenkins | oc apply -f - -n empr-mds-tools
oc process -f _jenkins.bc.json -l app=jenkins | oc apply -f - -n empr-mds-tools
oc process -f _jenkins.dc.json -l app=jenkins | oc apply -f - -n empr-mds-tools

