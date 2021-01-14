-- Changes description value from "Client delayed" to "Client Delayed".
UPDATE now_application_status SET description = 'Client Delayed' where now_application_status_code = 'CDI';