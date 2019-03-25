# Elastic Images

Elastic Images

## Configuration

### Environment Variables

| Name | Description |
| --- | --- |
| ES_VERSION | Elastic Version |
| ES_HOST | elastic cloud host |
| ES_USER | elastic user |
| ES_PASSWORD | elastic password |

## Openshift Configuration

Build the docker image

```bash
cd mds/elastic/logstash
docker build --build-arg ES_VERSION=6.6.2
```

Set up your deployment environemt with the following Environment Variables

| Name | Description |
| --- | --- |
| ES_HOST | elastic cloud host |
| ES_USER | elastic user |
| ES_PASSWORD | elastic password |

Mount a pvc at the following path in the container:

```bash
/usr/share/logstash/monitor
```

NGINX access.log written to this volume will be monitored by logstash.
