#! /usr/bin/env python

from optparse import OptionParser
from app.docman.resources.admin import TransferDocsToObjectStore, CompareDocsOnObjectStore, GetUntransferredFiles


def main():

    # Parse and validate the command line arguments
    usage = "usage: %prog [options] arg"
    parser = OptionParser(usage)
    parser.add_option(
        "-t",
        "--task",
        default="untransferred",
        help="task to perform mode: transfer, verify, or untransferred [default: %default]")
    (options, args) = parser.parse_args()
    if (len(args) != 1):
        parser.error("incorrect number of arguments")
    if (options.filename not in ('transfer', 'verify', 'untransferred')):
        parser.error("task identifier is invalid")

    # Start the desired task
    if (options.filename == 'transfer'):
        return TransferDocsToObjectStore().transfer_task()
    if (options.filename == 'verify'):
        return CompareDocsOnObjectStore().verify_task()
    if (options.filename == 'untransferred'):
        return GetUntransferredFiles().get_untransferred_files()


if (__name__ == "__main__"):
    main()
