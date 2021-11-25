# SSO Wallet Generation How-to

# Cert generation

# From NRIS
1. Request certifications from NRIS
openssl s_client -servername NAME -connect {NRIS}:{PORT} | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > nris.crt

# Create the wallet and add certifications
1. Install java
1. Install SQLCL for pre-requisite libs https://www.oracle.com/database/technologies/appdev/sqlcl.html
    - You can place these files unzipped in a `/oracle/` dir, it just needs to match the paths in the `orapki.bat` file
2. Use the `orapki.bat` file in the repo to perform wallet operations
    - Feel free to adjust the sqlcl path on line 16 of the `orapki.bat` to match your unzip location
    - For issues with the .bat file refer to https://ogobrecht.com/posts/2020-07-29-how-to-use-mkstore-and-orapki-with-oracle-instant-client/

`mkdir wallet`
`.\orapki.bat wallet create -wallet .\wallet\ -auto_login -pwd <PASSWD>`
`.\orapki.bat wallet add -wallet .\wallet\ -trusted_cert -cert .\nris.crt`

# Upload the wallet files to a configmap
1. eg: `oc -n <NS> create configmap 2021-odb-wallet --from-file=wallet/`
- Note: configmaps are create-only, so we'll take a timestamp approach
- update `wallet/` to match wherever you created the wallet
- these files will be encoded as binary on openshift's side

2. Adjust this block in the manifest mounting the configmap:
`
        spec:
          volumes:
            - name: logs-volume
              emptyDir: {}
            - name: odb-credentials
              configMap:
                name: odb-wallet # edit this name here to match your new configmap
                defaultMode: 420
`
