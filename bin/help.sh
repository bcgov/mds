#!/bin/bash
#========================================================================#
# MDS Help for usage
# Spits out a help message and usage suggestions
#========================================================================#
# Global config
# Color codes
CGREEN="\e[0;92m"
CRESET="\e[0m"
HELP="${CGREEN}
Welcome to the MDS Project - See below for suggested usage and how to get started developing on MDS\n\n

Suggested:\n
    If you're just starting on the project then run 'make valid' to check if you're missing any import tools or configurations.\n
    This command will also include remediation steps for any failures!\n\n

(Below commands assume 'make' before each command)\n
Usage:\n
\t    valid: checks your dev environment is setup correctly\n
\t    lite: creates a minimum viable setup, use to start working asap\n
\t    getdb: pulls a copy of the database in staging\n
\t    seeddb: uses a pulled copy to insert into your containerized postgresql database\n
\t    full: Stands up ALL services\n
\n
... and check the Makefile directly for other commands\n
\n
Happy mining!
${CRESET}"
echo -e $HELP