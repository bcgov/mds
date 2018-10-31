/*
Create/Update database views
*/


/*
Create a view to query Mine details and Mine location
and return relevant information for the MapView.
*/

CREATE OR REPLACE VIEW mine_map_view AS
SELECT md.mine_guid, ml.latitude, ml.longitude, md.mine_no, md.mine_name
FROM mine_detail md
INNER JOIN mine_location ml on ml.mine_guid=md.mine_guid
;