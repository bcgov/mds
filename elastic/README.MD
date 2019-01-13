# Mds-Elastic

## Steps

* Download [postgres jdbc driver](https://jdbc.postgresql.org/)
* Download [logstash 6.5](https://www.elastic.co/downloads/logstash) localy for testing 
* Installed [java 1.8 jdk](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)

new config for logstash in repo: elastic/logstash/

Test app is running locally

```cmd
bin\logstash -f C:\git\elastic\logstash\pipeline\mds.logstash.conf --path.data C:\Software\elastic\data\mds -l C:\Software\elastic\logs\mds
```
Configure jdbc apapter in `C:\git\elastic\logstash\pipeline\mds.logstash.conf`

```
jdbc {
        jdbc_driver_library => "C:\Software\elastic\jdbc\postgresql-42.2.5.jar"
        jdbc_driver_class => "org.postgresql.Driver"
        jdbc_connection_string => "jdbc:postgresql://localhost:5432/mds?user=user&password=pass"
        jdbc_user => "mds"
        # parameters => { "favorite_artist" => "Beethoven" }
        schedule => "* * * * *"
        statement => "SELECT * FROM public.mine_detail WHERE mine_no = 'BLAH1451'"
    }
```

Configure couple of filter

Create configuration for elasticsearch on docker [victoria-elastic-github](https://github.com/victoria-elasticsearch/november15)

Run docker
```
cd elastic
docker-compose up -d
```