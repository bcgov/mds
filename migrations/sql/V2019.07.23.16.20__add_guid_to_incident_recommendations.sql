ALTER TABLE mine_incident_recommendation
ADD COLUMN mine_incident_recommendation_guid uuid    DEFAULT gen_random_uuid() NOT NULL,
ADD COLUMN deleted_ind                       boolean DEFAULT FALSE             NOT NULL;
