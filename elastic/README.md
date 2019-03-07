# Quick notes


Load the dashboards

```bash

docker-compose up -d
docker exec -i -t mds-filebeat /bin/bash
filebeat setup --template -c /usr/share/filebeat/load/load-dash.yml
filebeat setup --dashboards -c /usr/share/filebeat/load/load-dash.yml
filebeat setup --machine-learning -c /usr/share/filebeat/load/load-dash.yml

```





