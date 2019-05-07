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