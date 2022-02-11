# SSL Renewal through certbot automation

# Overview
Request an automated certification renewal via an openshift cronjob.

Note: current method uses letsencrypt - migrate to Entrust when possible

# Deploy manifests
- use `oc -n 4c2ba9-* apply -f <manifest>` on the pertinent files in `ssl-certbot/`
- Deploy the imagestream & buildconfigs to the tools namespace
- Ensure rolebinds exist in tools namespace that connect to cerbot & certbot_pulling in the non-tool namespaces

# To run
- Remove the `suspend: true` value from the manifest and set the schedule value accordingly

# To reset
- The cert info is stored in the PVC. A new cert will not be issued while this exists so if you need to reset things for testing you'll need to delete the PVC. ALWAYS BE CAREFUL WHEN DELETING PVCs!!
