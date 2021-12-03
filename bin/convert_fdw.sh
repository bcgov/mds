# Kept for historical purposes - used to convert fdw to native psql
# pg_dump -h localhost  -U postgres -t mms.mmsins --schema-only -f /tmp/mmsschema mds
# pg_dump -h localhost  -U postgres -n mms --schema-only -f /tmp/mmsschema mds
# Convert fdw keys to native psql keys
OLD_KEYS=$(grep -nri "ALTER COLUMN.*.OPTIONS" /tmp/mmsschema)
echo "$OLD_KEYS" | while read -r K
do
    KEY=$(echo $K | awk '{ print $7 }')
    TABLE=$(echo $K | awk '{ print $4 }')
    echo "creating index for $KEY on $TABLE"
    INDEX="create index concurrently \"$KEY-$TABLE\" on $TABLE using btree($KEY);"
    echo $INDEX >> /tmp/mmsschema
done
# Remove foreign syntax
sed -i "s|FOREIGN ||g" /tmp/mmsschema
# Remove fdw server blocks
sed -i "/SERVER/,+4 d" /tmp/mmsschema
sed -i "s|SERVER.*||g" /tmp/mmsschema
# remove set and config commands
sed -i "s|GRANT SELECT ON.*.reader.*||g" /tmp/mmsschema
sed -i "s|GRANT USAGE ON SCHEMA mms TO fdw_reader\;||g" /tmp/mmsschema
sed -i "s|SET.*||g" /tmp/mmsschema
sed -i "s|SELECT pg_catalog.*||g" /tmp/mmsschema
# # Remove old fdw keys
sed -i "/OPTIONS/,+2 d" /tmp/mmsschema
sed -i "s|*.OPTIONS.*||g" /tmp/mmsschema
# # Correct brackets
sed -i "s|^)$|);|g" /tmp/mmsschema
# change src to dest schema
sed -i "s|mms\.|mms_test.|g" /tmp/mmsschema
sed -i "s|CREATE SCHEMA mms|CREATE SCHEMA mms_test|g" /tmp/mmsschema
sed -i "s|ALTER SCHEMA mms OWNER|ALTER SCHEMA mms_test OWNER|g" /tmp/mmsschema