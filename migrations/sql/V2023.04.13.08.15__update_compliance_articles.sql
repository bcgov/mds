UPDATE compliance_article 
  SET paragraph = '1'
WHERE 
  article_act_code = 'HSRCM' 
AND 
  section = '1'
AND
  sub_section = '7'
AND
  paragraph = '3';