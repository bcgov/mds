ALTER TABLE compliance_article ALTER COLUMN sub_paragraph TYPE varchar(8) USING sub_paragraph::varchar;

/*
This query updates the table compliance_article by setting the sub_paragraph field to null,
based on certain criteria. The purpose is to prevent the existing sub-paragraphs from being
selected along with the new ones that will be inserted.
*/
UPDATE compliance_article 
  SET sub_paragraph = null
WHERE 
  article_act_code = 'HSRCM' 
AND 
  section = '1'
AND
  sub_section = '7'
AND
  paragraph = '1';

INSERT
	INTO
	compliance_article
(
	article_act_code,
	"section",
	sub_section,
	paragraph,
	sub_paragraph,
	"description",
	effective_date,
	"expiry_date",
	create_user,	
	update_user,	
	long_description)
VALUES(
'HSRCM',
'1',
'7',
'1',
'(1)(a)',
'Serious injury or loss of life',
CURRENT_DATE,
'9999-12-31',
'system-mds',
'system-mds',
'Serious injury or loss of life');

INSERT
	INTO
	compliance_article
(
	article_act_code,
	"section",
	sub_section,
	paragraph,
	sub_paragraph,
	"description",
	effective_date,
	"expiry_date",
	create_user,
	create_timestamp,
	update_user,
	update_timestamp,
	long_description)
VALUES(
'HSRCM',
'1',
'7',
'1',
'(1)(b)',
'Potential to cause serious injury or loss of life',
CURRENT_DATE,
'9999-12-31',
'system-mds',
'2023-04-24 12:24:55.946',
'system-mds',
'2023-04-24 12:24:55.946',
'Potential to cause serious injury or loss of life');

INSERT
	INTO
	compliance_article
(
	article_act_code,
	"section",
	sub_section,
	paragraph,
	sub_paragraph,
	"description",
	effective_date,
	"expiry_date",
	create_user,
	update_user,
	long_description)
VALUES(
'HSRCM',
'1',
'7',
'1',
'(2)(a)',
'Major groundfall, slope failure or subsidence',
CURRENT_DATE,
'9999-12-31',
'system-mds',
'system-mds',
'Major groundfall, slope failure or subsidence');

INSERT
	INTO
	compliance_article
(
	article_act_code,
	"section",
	sub_section,
	paragraph,
	sub_paragraph,
	"description",
	effective_date,
	"expiry_date",
	create_user,
	update_user,
	long_description)
VALUES(
'HSRCM',
'1',
'7',
'1',
'(2)(b)',
'Structural failure or collapse',
CURRENT_DATE,
'9999-12-31',
'system-mds',
'system-mds',
'Structural failure or collapse');

INSERT
	INTO
	compliance_article
(
	article_act_code,
	"section",
	sub_section,
	paragraph,
	sub_paragraph,
	"description",
	effective_date,
	"expiry_date",
	create_user,	
	update_user,	
	long_description)
VALUES(
'HSRCM',
'1',
'7',
'1',
'(2)(c)',
'Dam cracking, subsidence, or deficiency that affects integrity',
CURRENT_DATE,
'9999-12-31',
'system-mds',
'system-mds',
'Dam cracking, subsidence, or deficiency that affects integrity');

INSERT
	INTO
	compliance_article
(
	article_act_code,
	"section",
	sub_section,
	paragraph,
	sub_paragraph,
	"description",
	effective_date,
	"expiry_date",
	create_user,	
	update_user,	
	long_description)
VALUES(
'HSRCM',
'1',
'7',
'1',
'(2)(d)',
'Out of control equipment',
CURRENT_DATE,
'9999-12-31',
'system-mds',
'system-mds',
'Out of control equipment');

INSERT
	INTO
	compliance_article
(
	article_act_code,
	"section",
	sub_section,
	paragraph,
	sub_paragraph,
	"description",
	effective_date,
	"expiry_date",
	create_user,	
	update_user,	
	long_description)
VALUES(
'HSRCM',
'1',
'7',
'1',
'(2)(e)',
'Inrush of water, mud, slurry or debris',
CURRENT_DATE,
'9999-12-31',
'system-mds',
'system-mds',
'Inrush of water, mud, slurry or debris');

INSERT
	INTO
	compliance_article
(
	article_act_code,
	"section",
	sub_section,
	paragraph,
	sub_paragraph,
	"description",
	effective_date,
	"expiry_date",
	create_user,	
	update_user,	
	long_description)
VALUES(
'HSRCM',
'1',
'7',
'1',
'(2)(f)',
'Significant inflow or release or ignition of explosive or flammables',
CURRENT_DATE,
'9999-12-31',
'system-mds',
'system-mds',
'Significant inflow or release or ignition of explosive or flammables');

INSERT
	INTO
	compliance_article
(
	article_act_code,
	"section",
	sub_section,
	paragraph,
	sub_paragraph,
	"description",
	effective_date,
	"expiry_date",
	create_user,	
	update_user,	
	long_description)
VALUES(
'HSRCM',
'1',
'7',
'1',
'(2)(g)',
'Other above-ground unexpected incident',
CURRENT_DATE,
'9999-12-31',
'system-mds',
'system-mds',
'Other above-ground unexpected incident');

INSERT
	INTO
	compliance_article
(
	article_act_code,
	"section",
	sub_section,
	paragraph,
	sub_paragraph,
	"description",
	effective_date,
	"expiry_date",
	create_user,	
	update_user,	
	long_description)
VALUES(
'HSRCM',
'1',
'7',
'1',
'(2)(h)',
'Other underground mine incident',
CURRENT_DATE,
'9999-12-31',
'system-mds',
'system-mds',
'Other underground mine incident');