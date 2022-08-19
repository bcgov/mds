### Docker Image for Fider. 

The docker image for fider has a complicated past, in order to remove legacy and copied code from the main mds repo, the following has been done. 


To create the fider image that can run with the current DB / Fider version do the following: 


1. Open https://github.com/EYDS-CA/nrm-feedback
2. Clone `git clone --recurse-submodules git@github.com:EYDS-CA/nrm-feedback.git` - It is important to make sure the submodule is at the right commit for the image to be built
3. Build `docker build -t fider -f Dockerfile.openshift .` to build the image 
4. Tag `docker tag fider:latest image-registry.apps.silver.devops.gov.bc.ca/4c2ba9-tools/fider:latest` 
5. Push `docker push --all-tags image-registry.apps.silver.devops.gov.bc.ca/4c2ba9-tools/fider`


### Improvements: 

Can automate this if we need to - There are no potential changes / developments in the foreseeing future. 

### Risks: 

Fider is running around version - v0.18.0 - This commit https://github.com/getfider/fider/tree/74ac88ed1f6dfac1a3adfb93eb9c8c325f0018a8 of the nrm submodule which points to fider.

If we need to use newer features of fider, upgrade is inevitatble and possibly requires a specalized data migration. 

The NRM fider repo is essentially created for certain tweaks required for NRM - Read more here - https://github.com/getfider/fider/tree/74ac88ed1f6dfac1a3adfb93eb9c8c325f0018a8