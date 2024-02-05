

class IssueCredentialIssuerState():
    #https://github.com/hyperledger/aries-rfcs/blob/main/features/0036-issue-credential/README.md#states-for-issuer

    PROPOSAL_RECEIVED = "proposal-received"
    OFFER_SENT = "offer-sent"
    REQUEST_RECEIVED = "request-received"
    CREDENTIAL_ISSUED = "credential-issued"
    DONE = "done"

    #if problem report is received
    ABANDONED = "abandoned"


    pending_credential_states = [PROPOSAL_RECEIVED, OFFER_SENT, REQUEST_RECEIVED]
    active_credential_states = [CREDENTIAL_ISSUED, DONE]

class DIDExchangeRequesterState():
    #https://github.com/hyperledger/aries-rfcs/tree/main/features/0023-did-exchange#requester
    START = "start" 
    INVITATION_RECEIVED = "invitation-received"
    REQUEST_SENT = "request-sent"
    RESPONSE_RECEIVED = "response-received"
    ABANDONED = "abandoned"
    COMPLETED = "completed"