#!/bin/bash
#========================================================================#
# MDS Help for usage
# Synopsis: Spits out a help message and usage suggestions
#========================================================================#
# Global config
# Color codes
CGREEN="\e[0;92m"
CRESET="\e[0m"
HELP="${CGREEN}
Welcome to the MDS Project - See below for suggested usage and how to get started developing on MDS\n\n

Suggested:\n
\t    If you're just starting on the project then run 'make valid' to check if you're missing any important tools or configurations.\n
\t    This command will also include remediation steps for failures!\n\n

(Below commands assume 'make' before each command)\n
Usage:\n
\t    env: creates boilerplate environment files\n
\t    valid: checks your dev environment is setup correctly\n
\t    lite: creates a minimum viable setup, use to start working asap\n
\t    rebuild: rebuilds the containers you currently have in use\n
\t    full: Stands up ALL services\n
\n
... and check the Makefile directly for other commands\n
\n
Happy mining!
${CRESET}"
echo -e $HELP