# Elastic Images

Elastic Images

## Configuration

### Environment Variables

| Name        | Description        |
| ----------- | ------------------ |
| ES_HOST     | elastic cloud host |
| ES_USER     | elastic user       |
| ES_PASSWORD | elastic password   |
| ENVIRONMENT_SUFFIX | MDS Environment |
| JDBC_CONNECTION_STRING | Connection string to mds postgres db |
| JDBC_USER | Name of the user |
| JDBC_PASSWORD | Jdbc password |

## Openshift Configuration

Build the docker image

```bash
cd mds/elastic/logstash
docker build -t mds_logstash
```

Set up your deployment environemt with the following Environment Variables

| Name        | Description        |
| ----------- | ------------------ |
| ES_HOST     | elastic cloud host |
| ES_USER     | elastic user       |
| ES_PASSWORD | elastic password   |

Mount a pvc at the following path in the container:

```bash
/app/logstash/monitor
```

NGINX access.log written to this volume will be monitored by logstash.
