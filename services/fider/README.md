### Docker Image for Fider. 

To create the fider image that can run with the current DB / Fider version do the following: 

Base Repo URL: https://github.com/bcgov/nrm-feedback

Running with latest fider version - v0.21.1 - https://github.com/bcgov/nrm-feedback-v0.21.1

Updated go version and build params to make things work, this should be merged into nrm-feedback upstream.


- Clone `git clone --recurse-submodules git@github.com:bcgov/nrm-feedback-v0.21.1` - It is important to make sure the submodule is at the right commit for the image to be built
- Build `docker build -t fider:21.1 -f Dockerfile.openshift .` to build the image 
- Tag `docker tag fider:21.1 image-registry.apps.silver.devops.gov.bc.ca/4c2ba9-tools/fider:21.1` 
- Push `docker push --all-tags image-registry.apps.silver.devops.gov.bc.ca/4c2ba9-tools/fider`


### Improvements: 

Can automate this if we need to - There are no potential changes / developments in the foreseeing future. 
