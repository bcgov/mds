#!/bin/sh

# run:
# ./AddHosts.sh add 127.0.0.1 document_manager_backend
# ./AddHosts.sh remove 10.20.1.2 test.com

# PATH TO YOUR HOSTS FILE
ETC_HOSTS=/etc/hosts


function remove() {
    # IP to add/remove.
    IP=$1
    # Hostname to add/remove.
    HOSTNAME=$2
    HOSTS_LINE="$IP[[:space:]]$HOSTNAME"
    if [ -n "$(grep -P $HOSTS_LINE $ETC_HOSTS)" ]
    then
        echo "$HOSTS_LINE Found in your $ETC_HOSTS, Removing now...";
        sudo sed -i".bak" "/$HOSTS_LINE/d" $ETC_HOSTS
    else
        echo "$HOSTS_LINE was not found in your $ETC_HOSTS";
    fi
}

function add() {
    IP=$1
    HOSTNAME=$2
    HOSTS_LINE="$IP[[:space:]]$HOSTNAME"
    line_content=$( printf "%s\t%s\n" "$IP" "$HOSTNAME" )
    if [ -n "$(grep $HOSTS_LINE $ETC_HOSTS)" ]
    then
        echo "$line_content already exists: $(grep $HOSTNAME $ETC_HOSTS)"
    else
        echo "Adding $line_content to your $ETC_HOSTS";
        sudo -- sh -c -e "echo '$line_content' >> /etc/hosts";

        if [ -n "$(grep $HOSTNAME $ETC_HOSTS)" ]
        then
            echo "$line_content was added succesfully";
        else
            echo "Failed to Add $line_content, Try again!";
        fi
    fi
}

$@