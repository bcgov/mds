# Elastic Images

Elastic Images

## Configuration

### Environment Variables

| Name        | Description        |
| ----------- | ------------------ |
| ELASTIC_HOST | elastic cloud host |
| ELASTIC_USERNAME | elastic user |
| ELASTIC_PASSWORD | elastic password |
| ENVIRONMENT_SUFFIX | MDS Environment |
| JDBC_CONNECTION_STRING | Connection string to mds postgres db |
| JDBC_USER | Name of the user |
| JDBC_PASSWORD | Jdbc password |

## Configure Watcher to send email

Update your [user-settings](https://www.elastic.co/guide/en/cloud-enterprise/current/ece-add-user-settings.html) with your [smtp configuration details](https://www.elastic.co/guide/en/watcher/current/email-services.html).

Once the email is configured, elasticsearch will be ready to send notifications.

## Openshift Configuration

Build the docker image

```bash
cd mds/elastic/logstash
docker build -t mds_logstash
```

Set up your deployment environemt with the existing Environment Variables

Mount a pvc at the following path in the container:

```bash
/app/logstash/monitor
```

folder `app/logstash/data` should also be mounted to a persistent drive.

NGINX access.log written to this volume will be monitored by logstash.
