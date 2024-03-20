-- compliance_article_emli_contact_xref , report_notification table. This cotains the parameters that needs to decide the notifications
CREATE TABLE IF NOT EXISTS report_notification
(
    compliance_article_emli_contact_xref_guid   uuid    DEFAULT gen_random_uuid() NOT NULL,
    compliance_article_id                       integer                           NOT NULL,
    contact_guid	                              uuid	                            NOT NULL,
    is_major_mine                               boolean default false             NOT NULL,
    is_regional_mine                            boolean default false             NOT NULL,

    FOREIGN KEY (compliance_article_id) REFERENCES compliance_article(compliance_article_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (contact_guid) REFERENCES emli_contact(contact_guid) DEFERRABLE INITIALLY DEFERRED,
    PRIMARY KEY (compliance_article_emli_contact_xref_guid)
);

ALTER TABLE report_notification OWNER TO mds;


CREATE TEMP TABLE IF NOT EXISTS temp_article_section_email_mapping (
	mapping_guid              	uuid DEFAULT gen_random_uuid(),
	"section"              	varchar,
	sub_section              	varchar,
	paragraph					varchar,
	sub_paragraph				varchar,
	is_major					boolean,
	is_regional					boolean,
	email						varchar
);

 INSERT INTO temp_article_section_email_mapping(
    "section",
    sub_section,
	paragraph,
	sub_paragraph,
	is_major,
	is_regional,
	email
) 
values	-- Fill these values with the data TODO
	('10', '1', '3', 'a', 'false', 'true', 'mines.inquiries@gov.bc.ca'),
	('1', '1', '1', NULL, 'true', 'false', 'mine.ergonomics@gov.bc.ca'),
	('1', '1', '1', NULL, 'false', 'true', 'duplicate.duplicate@gov.bc.ca'),
	('1', '1', '2', NULL, 'false', 'true', 'mineincidents@gov.bc.ca'),
	('1', '1', '3', NULL, 'false', 'true', 'mine.safety@gov.bc.ca');


INSERT INTO report_notification (
    compliance_article_id,
    contact_guid,
    is_major_mine,
    is_regional_mine
 )
	SELECT
        ca.compliance_article_id,
        ec.contact_guid, 
        tmp.is_major,
        tmp.is_regional
        FROM temp_article_section_email_mapping tmp
        INNER JOIN emli_contact ec 
        ON tmp.email = ec.email
        
        INNER JOIN compliance_article ca
        ON tmp."section" = ca."section" 
        AND
        	(CASE 
	        	WHEN tmp.sub_section IS NOT NULL AND tmp.paragraph IS NOT NULL AND tmp.sub_paragraph IS NOT NULL
	        		THEN ca.sub_section = tmp.sub_section 
	        			AND ca.paragraph = tmp.paragraph 
	        			AND ca.sub_paragraph = tmp.sub_paragraph 
	        	
	        	WHEN tmp.sub_section IS NOT NULL AND tmp.paragraph IS NOT NULL
	        		THEN ca.sub_section = tmp.sub_section 
	        			AND ca.paragraph = tmp.paragraph 

	        	WHEN tmp.sub_section IS NOT NULL
	        		THEN ca.sub_section = tmp.sub_section 
			END);


drop table temp_article_section_email_mapping;
