# Setup

This document goes over the steps to transition DeploymentConfigs to Deployment, as well as how to deploy them to ArgoCD

# Refactoring from DeploymentConfig to Deployment

## DeploymentConfigs vs Deployments

This article from the Red Hat Openshift documentation explains this fairly well

https://docs.openshift.com/container-platform/4.8/applications/deployments/what-deployments-are.html

Essentially, DeploymentConfigs are objects specific to the Red Hat Openshit platform, while Deployments are Kubernetes-native objects. Both work within Openshift, but only Deployments work outside of Openshift.

### Differences

Deployments do not have triggers, unlike DeploymentConfigs. Triggers can allow DeploymentConfigs to update themselves based on a particular change, such as a change to the ImageStream it uses for its pods or a change to the configuration specified in the DeploymentConfig object manifest.

Consult the documentation for Deployments to determine what is and what is not permitted in a Deployment. The documetation on the Kubernetes page does a good job at explaining them in addition to the Openshift docs.

Link to Kubernetes Deployment page:
https://kubernetes.io/docs/concepts/workloads/controllers/deployment/

# Deploying to ArgoCD

Currently, this is a manual step, but essentially what you're doing is copying over a valid build (NOTE: Valid meaning that it's based on an accepted pull request) from the MDS repo to tenant-gitops-4c2ba9 repo.

For example, if I have changes made are in the tusd project within the openshift4 directory, you'd perform this command

cp -r mds/openshift4/tusd tenant-gitops-4c2ba9/

NOTE: Make sure you request and get access to tenant-gitops-4c2ba9 first. This isn't provided as part of the typical developer onboarding as of the writing of this doc.
