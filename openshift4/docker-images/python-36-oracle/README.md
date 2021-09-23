## Oracle wallet for TCPS connection

Requirements:

1. OpenSSL (will be used to get SSL certificate)
2. OracleXE (orapki tool will be used)
3. git bash

### Steps:

4. retrive trust certificates from the server
   example in git bash:

```
	'echo | openssl s_client -servername NAME -connect {host}:{port} | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > {yourCertificateName}.crt'
```

2. create a wallet:
   example in powershell:

```
	orapki wallet create -wallet {yourWalletLocation} -auto_login -pwd {yourWalletPassword}
```

3. add trusted certificates from step 1 to your wallet. This step should be repeated for every certificate you want to add to the wallet:
   example in PowerShell:

```
	orapki wallet add -wallet {yourWalletLocation} -trusted_cert -cert {yourCertificatePath/yourCertificateName}
```

4. verify your wallet:
   example in PowerShell:

```
	orapki wallet display -wallet {yourWalletLocation}
```
