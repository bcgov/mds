###ROLES:

To add roles for jenkins to make changes to openshift you'll have to manually create accounts based on _jenkins.role.json:
Using JQ
`jq '{"kind":"List", "items":.objects}' _jenkins.role.json  |  oc replace -f -`