export interface IndividualChange {
  field_name: string;
  from: string | number | Date | boolean | null;
  to: string | number | Date | boolean | null;
}

export interface Change {
  updated_by: string;
  updated_at: Date;
  changeset: IndividualChange[];
}
