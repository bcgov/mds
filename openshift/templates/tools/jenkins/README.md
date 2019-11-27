###ROLES:

To add roles for jenkins to make changes to openshift you'll have to manually create accounts based on \_jenkins.role.json:
Using JQ
`jq '{"kind":"List", "items":.objects}' _jenkins.role.json | oc replace -f -`

To build the latest jenkins image, edit the build.sh with your PR number and run the command below
`./build.sh`

To deploy the latest jenkins image, run the command below
`./deploy.sh`
