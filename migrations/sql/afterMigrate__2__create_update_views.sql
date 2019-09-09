/*
Create/Update database views
*/


/*
Create a view to query Mine and return relevant information for the MapView.
*/

CREATE OR REPLACE VIEW mine_map_view AS
SELECT
    mine_guid,
    latitude ,
    longitude,
    mine_no  ,
    mine_name
FROM mine;
