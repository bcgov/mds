# VC's in Core

The core-api is integrated with [Traction](https://github.com/bcgov/traction). Traction is a multi-tenant solution to provide [Hyperledger Aries](https://www.hyperledger.org/projects/aries) wallets to BC Goverment offices that want to interact with Verifiable Credentials.

The Core-api is enabled to create out-of-band messages([spec](https://github.com/hyperledger/aries-rfcs/tree/main/features/0434-outofband#messages.README.md)) that contain did-exchange ([spec](https://github.com/hyperledger/aries-rfcs/blob/main/features/0023-did-exchange/README.md)) connection invitations.

The Core-api is enable to send credential-offer messages to connected wallets as way of initating the [issue-credential](https://github.com/hyperledger/aries-rfcs/tree/main/features/0036-issue-credential) protocol.

## Governance Documentation

The Mines Act Permit VC has public [governance documentation](https://github.com/bcgov/bc-vcpedia/blob/main/credentials/credential-bc-mines-act-permit.md) that should be kept up-to-date with any technical or process changes.

### Connection Establishment

This is abbreviated from the governance documentation above which will supercede this if unclear or out-of-date.

Happy Path UX Flow

1. A user in minespace can create a connection invitation, this connection will be directly related to the `party` record of the permitee.
1. The user then copies the connection invitation out of minespace
1. The user then provides that connection invitation to their company's digital wallet solution

- The Company's wallet will use the `did-exchange` protocol to establish a connection with the `CHIEF PERMITTING OFFICER OF MINES` (CPO) wallet used by Core.

Current Limitations:

- User can create many invitations until the party has an active connection, however if multiple invitations are created, then multiple are accepted. Multiple active connections may exist between the Company wallet and the CPO Wallet, this should not be allowed
- If an active connection exists, do not allow the processing of any further connection requests
- Deleting a connection is not accessible in the UI, It could be done manually by deleting the row in `party_verifiable_credential_connection`, and using the TenantUI (see links below) to delete the connection record in Traction.
- This may be needed for POC testing purposes, or if a company made a new corporate wallet.

### Credential Issuance

This is abbreviated from the governance documentation above which will supercede this if unclear or out-of-date.

Happy Path UX Flow

1. A user in core viewing a record with; an open permit, a major mine, and active digital wallet connection; will see a control to 'Issue Permit as Verifiable Credential"
1. Minespace will indicate to the user that the offer has been sent, and they should inspect their company wallet for the pending credential offer
1. The user will go to their Company's digital wallet and accept the credential offer
1. The two agents will complete the `issue credential` protocol until the credential_exchange record has the state `deleted` (`'deleted'` is successful, and means that the exchange is complete)
1. Minespace will show the credential was issued successfully, and the credential will now be available for presentation in the Company's digital wallet

Current Limitations:

- If the User chooses NOT to accept the credential to their wallet, Core-api will recieve a `problem-report` message
- The existence of this problem report should show in the Minespace and Core UI, as well as the text description contained in the problem-report
- Controls and endpoints should be built to allow for a new credential-offer when a problem report has been received on a previous offer

## OCA Bundle.

The Overlay Capture Architechture (OCA) bundle for this credential is hosted [here](https://github.com/bcgov/aries-oca-bundles/tree/main/OCABundles/schema). The OCA bundle provides infomation on how the credential should be presented, including backgroun colors, labels, data-typing, and localization. If the credential is updated, the OCA bundle may need to be updated to match.

OCA bundles hosted here can be previewed on the [OCA Explorer](https://bcgov.github.io/aries-oca-bundles/)

### Permit Amendments and Revocation

When a permit is amendended, the previous authorization is no longer valid and the new authorization should be the only valid credential that exist

After a new permit amendment is created for a permit

- A ministry user in Core should means to revoke the previous veriifable credentials
- The new version of the permit cannot be issued until existing credentials have been revoked

## Key identifiers and links

As of: Nov 3, 2023, Published by Jason Syrotuck, (JSyro on Github, or jason.syrotuck@nttdata.com)

- The public DID for the `Chief Permitting Officer of Mines` is written to public ledger, these are configured by Traction, but connected partners may ask for these details.

Public DID:

- Dev : [S7S2wzcF2giKuwxdeLBk69](http://test.bcovrin.vonx.io/browse/domain?page=1&query=S7S2wzcF2giKuwxdeLBk69&txn_type=1) on [BCovrin Test](http://test.bcovrin.vonx.io/)
- Test Ledger: [SG22gyoUVsC7TiC9m68ytU](http://test.bcovrin.vonx.io/browse/domain?page=1&query=SG22gyoUVsC7TiC9m68ytU&txn_type=1) on [BCovrin Test](http://test.bcovrin.vonx.io/) (same as dev)
- Prod Ledger: [A2UZSmrL9N5FDZGPu68wy](https://candyscan.idlab.org/tx/CANDY_PROD/domain/321) on [CANdy-Prod](https://candyscan.idlab.org/home/CANDY_DEV)

Schema v1.1.1:

- Dev: `S7S2wzcF2giKuwxdeLBk69:2:bc-mines-act-permit:1.1.1` on BCovrin Test ([TXN](http://test.bcovrin.vonx.io/))
- Test: `S7S2wzcF2giKuwxdeLBk69:2:bc-mines-act-permit:1.1.1` on BCovrin Test ([TXN](http://test.bcovrin.vonx.io/))
- Prod: `A2UZSmrL9N5FDZGPu68wy:2:bc-mines-act-permit:1.1.1` on CANdy-Prod ([TXN](https://candyscan.idlab.org/tx/CANDY_PROD/domain/361))

Credential Definitions for v1.1.1:

- Dev: `S7S2wzcF2giKuwxdeLBk69:3:CL:171126:mds-dev-revok` on BCovrin Test ([TXN](http://test.bcovrin.vonx.io/))
- Test: `SG22gyoUVsC7TiC9m68ytU:3:CL:171126:mds-test-revok` on BCovrin Test ([TXN](http://test.bcovrin.vonx.io/))
- Prod: `A2UZSmrL9N5FDZGPu68wy:3:CL:361:mds-prod-revok` on CANdy-Prod ([TXN](https://candyscan.idlab.org/txs/CANDY_PROD/domain?page=1&pageSize=50&filterTxNames=[]&sortFromRecent=true&search=A2UZSmrL9N5FDZGPu68wy:3:CL:361:mds-prod-revok))

Tenant UI:

- [Dev Traction Tenant UI](https://traction-tenant-ui-dev.apps.silver.devops.gov.bc.ca/)
- [Test Traction Tenant UI](https://traction-tenant-ui-test.apps.silver.devops.gov.bc.ca/)
- [Prod Traction Tenant UI](https://traction-tenant-ui-prod.apps.silver.devops.gov.bc.ca/)

Traction Tenant ID:

- Dev: `fb4090f1-bd27-45a8-9839-d58abdf54e76`
- Test: `cecfcac5-2945-460b-a43b-756c4fe6c017`
- Prod: `7455e995-aacc-4797-a25f-e1f4a2bcdbb8`

Traction Api Keys:

- These are not stored here, API keys can be destroyed and replaced if compromised, unlike the Wallet Key, which is immutable.

**Wallet ID and Wallet Key are considered the Admin login for the wallets, they are not stored here but should be stored in a permanent and secure location like a password manager.**

Traction Tenant API:

- [Dev Traction API](https://traction-tenant-proxy-dev.apps.silver.devops.gov.bc.ca/api/doc)
- [Test Traction API](https://traction-tenant-proxy-test.apps.silver.devops.gov.bc.ca/api/doc)
- [Test Traction API](https://traction-tenant-proxy-prod.apps.silver.devops.gov.bc.ca/api/doc)

## Webhook URL

Traction is configured to call the Core-api with HTTP requests when protocol events happen. Should these need to be reviewed or changed, navigate to the Tenant UI of the environment you want to view/change and navigate to `/tenant/settings` through the upper right wallet avatar.

### Core-api Environment Variables

Example Environment Variables these connnect to Dev Traction.

```
TRACTION_HOST=https://traction-tenant-proxy-dev.apps.silver.devops.gov.bc.ca
TRACTION_TENANT_ID=fb4090f1-bd27-45a8-9839-d58abdf54e76
TRACTION_WALLET_API_KEY=c664c4c9ad6e4cfe9010f83aea8504e5
CRED_DEF_ID_MINES_ACT_PERMIT=S7S2wzcF2giKuwxdeLBk69:3:CL:171126:mds-dev-revok
TRACTION_WEBHOOK_X_API_KEY=1263835957285d576a09466f2d5f6142
```

These values could be used for local development, however you will not receive webhooks back from Traction unless you create a public tunnel (like NRGROK) and set tractions with that webhook url.

## Race Conditions

Webhook processing may be inconsistent, causing messages to be processed incorrectly. Some protection should be added to ensure that if a message state is going to send a protocol backwards, it should be ignored. Discussions are ongoing with Traction to see if the webhook can provide some timing data to help this processing.
