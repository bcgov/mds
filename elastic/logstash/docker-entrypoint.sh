#!/bin/bash
set -e

# Files created by Logstash should always be group writable too
umask 0002

run_as_other_user_if_needed() {
    if [[ "$(id -u)" == "0" ]]; then
        # If running as root, drop to specified UID and run command
        exec chroot --userspec=1000 / "${@}"
    else
        # Either we are running in Openshift with random uid and are a member of the root group
        # or with a custom --user
        exec "${@}"
    fi
}

# Allow user specify custom CMD, maybe bin/logstash itself
# for example to directly specify `-E` style parameters for logstash on k8s
# or simply to run /bin/bash to check the image
if [[ "$1" != "eswrapper" ]]; then
    if [[ "$(id -u)" == "0" && $(basename "$1") == "logstash" ]]; then
        set -- "logstash" "${@:2}"
        # Use chroot to switch to UID 1000
        exec chroot --userspec=1000 / "$@"
    else
        # User probably wants to run something else, like /bin/bash, with another uid forced (Openshift?)
        exec "$@"
    fi
fi

if [[ "$(id -u)" == "0" ]]; then
    # If requested and running as root, mutate the ownership of bind-mounts
    if [[ -n "$TAKE_FILE_OWNERSHIP" ]]; then
        chown -R 1000:0 /usr/share/logstash/{data,logs}
    fi
fi

env2yaml /usr/share/logstash/config/logstash.yml

export LS_JAVA_OPTS="-Dls.cgroup.cpuacct.path.override=/ -Dls.cgroup.cpu.path.override=/ $LS_JAVA_OPTS"

if [[ -z $1 ]] || [[ ${1:0:1} == '-' ]] ; then
  run_as_other_user_if_needed logstash "$@"
else
  run_as_other_user_if_needed "$@"
fi