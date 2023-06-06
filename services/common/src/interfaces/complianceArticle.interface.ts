export interface IComplianceArticle {
  compliance_article_id: number;
  article_act_code: string;
  section: string;
  sub_section: string;
  paragraph: string;
  sub_paragraph: string;
  description: string;
  long_description: string;
  effective_date: Date;
  expiry_date: Date;
}
