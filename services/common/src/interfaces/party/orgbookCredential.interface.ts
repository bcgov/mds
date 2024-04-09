export interface IOrgbookCredential {
  id: number;
  create_timestamp: string;
  effective_date: string;
  inactive: boolean;
  latest: boolean;
  revoked: boolean;
  revoked_date: string;
  credential_id: string;
  credential_type: CredentialType;
  addresses: any[];
  attributes: Attribute[];
  names: Name[];
  local_name: LocalName;
  remote_name: any;
  topic: Topic;
  related_topics: any[];
  credential_set: CredentialSet;
}

interface CredentialType {
  id: number;
  issuer: Issuer;
  has_logo: boolean;
  create_timestamp: string;
  update_timestamp: string;
  description: string;
  credential_def_id: string;
  last_issue_date: string;
  url: string;
  credential_title: string;
  highlighted_attributes: string[];
  schema_label: SchemaLabel;
  schema: Schema;
}

interface Issuer {
  id: number;
  has_logo: boolean;
  create_timestamp: string;
  update_timestamp: string;
  did: string;
  name: string;
  abbreviation: string;
  email: string;
  url: string;
  endpoint: string;
}

interface SchemaLabel {
  en: En;
}

interface En {
  label: string;
  description: string;
}

interface Schema {
  id: number;
  create_timestamp: string;
  update_timestamp: string;
  name: string;
  version: string;
  origin_did: string;
}

interface Attribute {
  id: number;
  type: string;
  format: string;
  value: string;
  credential_id: number;
}

interface Name {
  id: number;
  text: string;
  language: string;
  credential_id: number;
  type: string;
}

interface LocalName {
  id: number;
  text: string;
  language: string;
  credential_id: number;
  type: string;
}

interface Topic {
  id: number;
  create_timestamp: string;
  update_timestamp: string;
  source_id: string;
  type: string;
  names: Name[];
  local_name: LocalName;
  remote_name: any;
  addresses: any[];
  attributes: Attribute[];
}

interface CredentialSet {
  id: number;
  create_timestamp: string;
  update_timestamp: string;
  latest_credential_id: number;
  topic_id: number;
  first_effective_date: string;
  last_effective_date: string;
  credentials: IOrgbookCredential[];
}
