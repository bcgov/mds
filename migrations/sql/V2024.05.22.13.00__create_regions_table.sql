CREATE TABLE IF NOT EXISTS regions (
    regional_district_id INT NOT NULL PRIMARY KEY,
    name varchar(255) NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO regions (regional_district_id, name, create_user, update_user)
VALUES (4786586, 'Alberni-Clayoquot', 'system-mds', 'system-mds'),
       (4786587, 'Bulkley-Nechako', 'system-mds', 'system-mds'),
       (4786588, 'Capital', 'system-mds', 'system-mds'),
       (4786590, 'Cariboo', 'system-mds', 'system-mds'),
       (4786592, 'Central Coast', 'system-mds', 'system-mds'),
       (4786597, 'Central Kootenay', 'system-mds', 'system-mds'),
       (4786600, 'Central Okanagan', 'system-mds', 'system-mds'),
       (4786601, 'Columbia Shuswap', 'system-mds', 'system-mds'),
       (4786602, 'Comox Valley', 'system-mds', 'system-mds'),
       (51541265, 'Comox-Strathcona (Island)', 'system-mds', 'system-mds'),
       (51541257, 'Comox-Strathcona (Mainland)', 'system-mds', 'system-mds'),
       (4786603, 'Cowichan Valley', 'system-mds', 'system-mds'),
       (4786604, 'East Kootenay', 'system-mds', 'system-mds'),
       (4786605, 'Fraser Valley', 'system-mds', 'system-mds'),
       (4786636, 'Fraser-Fort George', 'system-mds', 'system-mds'),
       (4786650, 'Kitimat-Stikine', 'system-mds', 'system-mds'),
       (4786651, 'Kootenay Boundary', 'system-mds', 'system-mds'),
       (4786671, 'Metro Vancouver', 'system-mds', 'system-mds'),
       (4786672, 'Mount Waddington', 'system-mds', 'system-mds'),
       (4786678, 'Nanaimo', 'system-mds', 'system-mds'),
       (4786699, 'North Coast', 'system-mds', 'system-mds'),
       (4786683, 'North Okanagan', 'system-mds', 'system-mds'),
       (4786684, 'Northern Rockies', 'system-mds', 'system-mds'),
       (4786686, 'Okanagan-Similkameen', 'system-mds', 'system-mds'),
       (4786687, 'Peace River', 'system-mds', 'system-mds'),
       (4786690, 'qathet', 'system-mds', 'system-mds'),
       (4786712, 'Squamish-Lillooet', 'system-mds', 'system-mds'),
       (7043686, 'Stikine', 'system-mds', 'system-mds'),
       (4786713, 'Strathcona', 'system-mds', 'system-mds'),
       (4786714, 'Sunshine Coast', 'system-mds', 'system-mds'),
       (4786722, 'Thompson-Nicola', 'system-mds', 'system-mds');