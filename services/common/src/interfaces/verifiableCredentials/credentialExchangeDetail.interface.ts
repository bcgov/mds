interface IAttribute {
  name: string;
  value: string;
}

interface ITraceReport {
  target: string;
  full_thread: boolean;
  trace_reports: any[];
}

interface ICredentialProposalDict {
  "@type": string;
  "@id": string;
  "~trace": ITraceReport;
  comment: string;
  credential_proposal: {
    "@type": string;
    attributes: IAttribute[];
  };
  cred_def_id: string;
}

interface ICredentialOfferDict {
  "@type": string;
  "@id": string;
  "~thread": {
    thid: string;
  };
  "~trace": ITraceReport;
  comment: string;
  credential_preview: {
    "@type": string;
    attributes: IAttribute[];
  };
  offers_attach: {
    "@id": string;
    "mime-type": string;
    data: {
      base64: string;
    };
  }[];
}

interface ICredentialRequest {
  prover_did: string;
  cred_def_id: string;
  blinded_ms: {
    u: string;
    ur: string;
    hidden_attributes: string[];
    committed_attributes: any;
  };
  blinded_ms_correctness_proof: {
    c: string;
    v_dash_cap: string;
    m_caps: {
      master_secret: string;
    };
    r_caps: any;
  };
  nonce: string;
}

interface ICredential {
  schema_id: string;
  cred_def_id: string;
  rev_reg_id: string;
}

export interface ICredentialExchange {
  state: string;
  created_at: string;
  updated_at: string;
  trace: boolean;
  credential_exchange_id: string;
  connection_id: string;
  thread_id: string;
  initiator: string;
  role: string;
  credential_definition_id: string;
  schema_id: string;
  credential_proposal_dict: ICredentialProposalDict;
  credential_offer_dict: ICredentialOfferDict;
  credential_offer: any; // Type is not clear from provided data
  credential_request: ICredentialRequest;
  credential: Credential;
  auto_offer: boolean;
  auto_issue: boolean;
  revoc_reg_id: string;
  revocation_id: string;
}
