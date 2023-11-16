export interface ICreateVariancePayload {
  received_date: string;
  compliance_article_id: number;
  variance_application_status_code: string;
  note?: string;
  variance_document_category_code?: string;
}
