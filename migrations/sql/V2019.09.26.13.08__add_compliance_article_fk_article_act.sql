ALTER TABLE compliance_article ADD CONSTRAINT compliance_article_article_act_code_fk
    FOREIGN KEY (article_act_code)
    REFERENCES article_act_code(article_act_code);