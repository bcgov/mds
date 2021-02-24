UPDATE activity_detail
SET cut_line_length_unit_type_code = 'KMT'
FROM (SELECT ad.activity_detail_id
    FROM activity_detail ad
        JOIN activity_summary_detail_xref asdx ON asdx.activity_detail_id = ad.activity_detail_id
        JOIN activity_summary as2 ON as2.activity_summary_id = asdx.activity_summary_id
    WHERE as2.activity_type_code = 'cut_lines_polarization_survey') AS cut_lines
WHERE cut_lines.activity_detail_id = activity_detail.activity_detail_id;


UPDATE activity_detail
SET length_unit_type_code = 'KMT'
FROM (SELECT ad.activity_detail_id
    FROM activity_detail ad
        JOIN activity_summary_detail_xref asdx ON asdx.activity_detail_id = ad.activity_detail_id
        JOIN activity_summary as2 ON as2.activity_summary_id = asdx.activity_summary_id
    WHERE as2.activity_type_code = 'exploration_access') AS cut_lines
WHERE cut_lines.activity_detail_id = activity_detail.activity_detail_id;

UPDATE activity_detail
SET length_unit_type_code = 'MTR'
    ,depth_unit_type_code = 'MTR'
    ,width_unit_type_code = 'MTR'
FROM (SELECT ad.activity_detail_id
    FROM activity_detail ad
        JOIN activity_summary_detail_xref asdx ON asdx.activity_detail_id = ad.activity_detail_id
        JOIN activity_summary as2 ON as2.activity_summary_id = asdx.activity_summary_id
    WHERE as2.activity_type_code = 'settling_pond') AS cut_lines
WHERE cut_lines.activity_detail_id = activity_detail.activity_detail_id;

UPDATE activity_detail
SET length_unit_type_code = 'MTR'
    ,height_unit_type_code = 'MTR'
    ,width_unit_type_code = 'MTR'
FROM (SELECT ad.activity_detail_id
    FROM activity_detail ad
        JOIN activity_summary_detail_xref asdx ON asdx.activity_detail_id = ad.activity_detail_id
        JOIN activity_summary as2 ON as2.activity_summary_id = asdx.activity_summary_id
    WHERE as2.activity_type_code = 'underground_exploration') AS cut_lines
WHERE cut_lines.activity_detail_id = activity_detail.activity_detail_id;

UPDATE activity_detail
SET length_unit_type_code = 'MTR'
    ,width_unit_type_code = 'MTR'
FROM (SELECT ad.activity_detail_id
    FROM activity_detail ad
        JOIN activity_summary_detail_xref asdx ON asdx.activity_detail_id = ad.activity_detail_id
        JOIN activity_summary as2 ON as2.activity_summary_id = asdx.activity_summary_id
    WHERE as2.activity_type_code = 'placer_operation') AS cut_lines
WHERE cut_lines.activity_detail_id = activity_detail.activity_detail_id;