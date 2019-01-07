/*
Create/Update database views
*/


/*
Create a view to query Mine details and Mine location
and return relevant information for the MapView.
*/

CREATE OR REPLACE VIEW mine_map_view AS
SELECT mi.mine_guid, ml.latitude, ml.longitude, mi.mine_no, mi.mine_name
FROM mine mi
INNER JOIN mine_location ml on ml.mine_guid=mi.mine_guid
;