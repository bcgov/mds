# Manually runnning jobs or services

Openshift limits network availability for manual runs (i.e. resources that are applied manually.)

If you need to modify a service that uses a network (such as nris for its Oracle connection), you should change the image of a
pre-existing, automatically created service. This makes sense since we've handled all the gotchas within the config, rather than having
any ambiguity with using built in oc commands to spin up resources.

Might have to do with the user we assume.
Any job we create manually is under our own user, rather than a Kubernetes user, which have their own network policies.

Make sure to set parallelism to 1 to make sure it does not create a bunch of pods when it fails. It will
keep failing one pod at a time.


# Clearing DB logs if full:

Postgres in separate PVC mounted at /pg_logs, CRON job is configured to clear logs periodically which are older than the current day. 
