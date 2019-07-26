###ROLES:

To add roles for digdag to make changes to openshift you'll have to manually create accounts based on digdag_sa.role.json:
Using JQ
`jq '{"kind":"List", "items":.objects}' digdag_sa.role.json | oc create -f -`
