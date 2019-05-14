ALTER TABLE compliance_article ADD COLUMN long_description text;
UPDATE compliance_article SET long_description = description;
INSERT INTO compliance_article
    (
    article_act_code,
    section,
    sub_section,
    paragraph,
    sub_paragraph,
    description,
    long_description,
    effective_date,
    expiry_date,
    create_user,
    update_user
    )
VALUES
    ('HSRCM', '1', '7', '3', '(1)', 'Unexpected major groundfall or subsidence', 'Unexpected major groundfall or subsidence, whether on surface or underground, which endangers people or damages equipment or poses a threat to people or property', '1970-01-01', '9999-12-31', 'system-mds', 'system-mds'),
    ('HSRCM', '1', '7', '3', '(2)', 'Dam cracking or subsidence', 'Cracking or subsidence of a dam or impoundment dike, unexpected seepage or appearance of springs on the outer face of a dam or dike; loss of adequate freeboard, washout or significant erosion of a dam or dike, any of which might adversely affect the integrity of such structures', '1970-01-01', '9999-12-31', 'system-mds', 'system-mds'),
    ('HSRCM', '1', '7', '3', '(3)', 'Mine hoisting plant accident', 'Any accident involving a mine hoisting plant and including sheaves, hoisting rope, shaft conveyance, shaft, shaft timber, or headframe structure', '1970-01-01', '9999-12-31', 'system-mds', 'system-mds'),
    ('HSRCM', '1', '7', '3', '(4)', 'Inrush of water or debris', 'Unexpected inrush of water, mud, slurry, or debris', '1970-01-01', '9999-12-31', 'system-mds', 'system-mds'),
    ('HSRCM', '1', '7', '3', '(5)', 'Explosion', 'Premature or unexpected explosion of explosives, gas or any dust', '1970-01-01', '9999-12-31', 'system-mds', 'system-mds'),
    ('HSRCM', '1', '7', '3', '(6)', 'Release of dangerous gas', 'Significant inflow or release of explosive or other dangerous gas', '1970-01-01', '9999-12-31', 'system-mds', 'system-mds'),
    ('HSRCM', '1', '7', '3', '(7)', 'Stoppage of ventilation', 'Unplanned stoppage of the main underground ventilation system', '1970-01-01', '9999-12-31', 'system-mds', 'system-mds'),
    ('HSRCM', '1', '7', '3', '(8)', 'Out of control vehicle', 'A mine vehicle going out of control', '1970-01-01', '9999-12-31', 'system-mds', 'system-mds'),
    ('HSRCM', '1', '7', '3', '(9)', 'Fire', 'Outbreak of fire if it endangers persons or threatens or damages equipment and all underground fires', '1970-01-01', '9999-12-31', 'system-mds', 'system-mds'),
    ('HSRCM', '1', '7', '3', '(10)', 'Electrical equipment failure', 'Electrical equipment failure or incident that causes or threatens to cause injury to persons or damage to equipment or property', '1970-01-01', '9999-12-31', 'system-mds', 'system-mds'),
    ('HSRCM', '1', '7', '3', '(11)', 'Any other unusual accident', 'Any other unusual accident or unexpected event which had the potential to result in serious injury', '1970-01-01', '9999-12-31', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;
 
CREATE TABLE IF NOT EXISTS mine_incident_determination_type
(
    mine_incident_determination_type_code   character varying(3) PRIMARY KEY,
    description                             character varying(100) NOT NULL,
    display_order                           integer NOT NULL,
    active_ind                              boolean NOT NULL DEFAULT 'true',

    create_user                             character varying(60)                    NOT NULL,
    create_timestamp                        timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                             character varying(60)                    NOT NULL,
    update_timestamp                        timestamp with time zone DEFAULT now()   NOT NULL
);
ALTER TABLE mine_incident_determination_type OWNER TO mds;
COMMENT ON TABLE mine_incident_determination_type IS ' A lookup table of types for indicating if a given mine_incident is a dangerous occurrence.';

CREATE TABLE IF NOT EXISTS mine_incident_do_subparagraph
(
    mine_incident_id integer NOT NULL,
    compliance_article_id integer NOT NULL,

    PRIMARY KEY(mine_incident_id, compliance_article_id),
    FOREIGN KEY (mine_incident_id) REFERENCES mine_incident(mine_incident_id),
    FOREIGN KEY (compliance_article_id) REFERENCES compliance_article(compliance_article_id)
);
ALTER TABLE mine_incident_do_subparagraph OWNER TO mds;
COMMENT ON TABLE mine_incident_do_subparagraph IS 'A list of compliance code sub-paragraphs relevant to a mine_incident that is deemed to be a dangerous occurrence.';

ALTER TABLE mine_incident ADD COLUMN determination_type_code character varying(3) default 'PEN';
ALTER TABLE mine_incident ADD CONSTRAINT mine_incident_determination_fkey FOREIGN KEY (determination_type_code) REFERENCES mine_incident_determination_type(mine_incident_determination_type_code)