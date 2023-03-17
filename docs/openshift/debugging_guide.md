# Openshift 4.x CI/CD debugging guide

Some tidbits around debugging CI/CD issues on Openshift and info for interacting with Openshift

# Github actions

Github has excellent [docs](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions) for learning actions. Give this a read to understand the high level view of actions.

# Openshift CLI connections

- Once your changes are merged, the way that changes move to openshift occur in 2 ways: CLI calls, and pushing artifacts (docker images)
- The openshift CLI is very robust with great docs, you can drill down into the help of any part like so: `oc -h` for overview, then `oc apply -h` for docs specifically around the `apply` command. These come with examples too!
- Always check the Openshift cluster version, at the time of writing it is 4.10 - you can find docs for the majority of our workloads here: [4.10 API Ref](https://docs.openshift.com/container-platform/4.10/rest_api/workloads_apis/workloads-apis-index.html)
- Additional reading resource: [BCGov Openshift Wiki](https://github.com/BCDevOps/openshift-wiki/tree/master/docs)

# Openshift DeploymentConfigs

The majority of Core's services are still using DeploymentConfigs and these follow a hiearchal pattern where child objects (not every object is a child) inherit configuration from the parent object, that hierchary could be described as follows:

```
|-HorizontalPodAutoscaler
|+DeploymentConfig
 |+ReplicationController
  |+Pod(s)
   |+Container(s)
```

You can see above that Pods will inherit their configuration from the DeploymentConfig, so if you wish to make changes to pods, you need to edit it at top-level parent object to be sure (the DeploymentConfig in this case). We also see that HPA (HorizontalPodAutoscaler) is adjacent to the DeploymentConfig, so it does not inherit configuration from it, BUT it does modify the configuration of other resources (the pod # of the ReplicationController for scaling purposes). Always remember that Openshift is a real time system with resources constantly changing eachother - do not expect anything to be static.

## Common Deployment issues

### Liveness/Readiness probe fail

`Note`: a Liveness/Readiness probe fail frequently occurs during a working deployment as the pods are replaced.

`Symptoms`: constant pod restarts and probe failures in the `Events` tab of the pod

`Cause`: Double check your liveness/readiness probe configuration in the manifests, it could be too short and your deployment is taking longer than expected, or the path is no longer current if the application was updated.

`Fix`: Fix the above mentioned configuration, you can sanity check by deleting the probes from the manifest and see if everything runs as expected without them - make sure they're recreated.

### Quota denials

`Symptoms`: Deployments fail / hang, quota warnings in `Events` tab of the resource

`Cause`: There's no resource space to allocate for the new pod(s)

`Fix`: adjust resource usage of this deployment or others. You can potentially request more quota from platform services but it needs to be backed up with a sysdig dashboard report

### Entry point issue

`Symptoms`: Pod fails immediately

`Cause`: The entrypoint command is incorrect, potentially after a source code change, migration failure, or version update

`Fix`: run `oc debug` on the DeploymentConfig (parent resource) because the pod likely won't exist, then run the entrypoint command manually yourself, adjust until it works correctly. This was likely caused by a fundamental change like a different base image.

### Widespread outage

`Symptoms`: multiple pods failing, with pre-existing pods also not working

`Cause`: the issue is major and far reaching, so there's 2 likely causes: the platform itself (rare) or our database

`Fix`: Check on the database, usually if there's an issue it's from a full PVC, potentially from a large log file, you can track down which part of the file system by running `df` and for logs you'll want to navigate to `pg_log/` somewhere in that volume, then delete the specific bloated log file. BE CAREFUL, if you delete the wrong directory here, you'll delete application data and require a backup

# Secondary Resources

- ReplicationControllers: created from deploymentconfigs, each replication controller manages a revision of pods, and is responsible for creating/deleting the pods within that revision
- HorizontalPodAutoscaler: Manipulates a controller based on metrics to best scale a set of pods
- Pods: unit of work within Openshift, contains 1+ containers, but 1:1 is best practice

# PVCs

PersistentVolumeClaims (PVC) are the primary persistent storage solution on Openshift and provide your workloads with state. There's 2 characteristics to be aware of for PVCs.

1. You can only increase the size of an existing PVC, not decrease it
2. While it's easy to delete and recreate the manifest that describes a PVC, the data itself is not persistent across deletions, so act carefully when dealing with PVCs

If The type is `netapp-file-backup` then data is redundantly stored in the data centre and it's possible to recover data if the PVC is deleted but only by request
