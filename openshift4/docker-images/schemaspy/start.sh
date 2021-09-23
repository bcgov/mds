#!/bin/sh

# The POSTGRESQL_ referances are here for compatibility with
# another implementation that only supported PostgreSQL
#
DB_TYPE=${DATABASE_TYPE-pgsql}
DB_NAME=${DATABASE_NAME-${POSTGRESQL_DATABASE}}
DB_HOST=${DATABASE_HOST-${DATABASE_SERVICE_NAME}}
DB_SCHEMA=${DATABASE_SCHEMA-public}
DB_CATALOG=${DATABASE_CATALOG-}
DB_DRIVER=${DATABASE_DRIVER}

DB_USER=${DATABASE_USER-${POSTGRESQL_USER}}
DB_PASSWORD=${DATABASE_PASSWORD-${POSTGRESQL_PASSWORD}}

ADDITIONAL_ARGS=${SCHEMASPY_ARGUMENTS-}
OVERRIDE_ARGS=${SCHEMASPY_COMMAND_OVERRIDE-}

SERVER_PORT=${SCHEMASPY_PORT-8080}
OUTPUT_PATH=${OUTPUT_PATH-output}
SCHEMASPY_PATH=${SCHEMASPY_PATH-lib/schemaspy.jar}

validateEnvironmentSettings() {
  # The database type must be specified.
  if [ -z "$DB_TYPE" ]; then
    echo "ERROR: Environment variable DATABASE_TYPE is required."
    FAIL=1
  fi

  # Host, username, and password are required for everything other than SQLite.
  if [ "$DB_TYPE" != *"sqlite"* ]; then
    if [ -z "$DB_HOST" ]; then
      echo "ERROR - Environment variable DATABASE_HOST is required."
      FAIL=1
    fi
    if [ -z "$DB_USER" ]; then
      echo "ERROR - Environment variable DATABASE_USER is required."
      FAIL=1
    fi
    if [ -z "$DB_PASSWORD" ]; then
      echo "ERROR - Environment variable DATABASE_PASSWORD is required."
      FAIL=1
    fi
  fi

  if [ -z "$DB_NAME" ]; then
    echo "ERROR - Environment variable DATABASE_NAME is required."
    FAIL=1
  fi

  if [ -n "$FAIL" ]; then
    exit 1
  fi
}

getCmdParameters() {
  if [ ! -z "$DB_TYPE" ]; then
    ARGS="$ARGS -t \"$DB_TYPE\""
  fi

  if [ ! -z "$DB_NAME" ]; then
    ARGS="$ARGS -db \"$DB_NAME\""
  fi

  if [ ! -z "$DB_DRIVER" ]; then
    ARGS="$ARGS -dp \"$DB_DRIVER\""
  fi

  if [ ! -z "$SCHEMASPY_HQ" ]; then
    ARGS="$ARGS -hq"
  fi

  if [ -n "$DB_CATALOG" ]; then
    ARGS="$ARGS -cat \"$DB_CATALOG\""
  fi

  if [ -n "$DB_USER" ]; then
    ARGS="$ARGS -u \"$DB_USER\""
  fi

  if [ -n "$DB_PASSWORD" ]; then
    ARGS="$ARGS -p \"$DB_PASSWORD\""
  fi

  if [ -n "$DB_HOST" ]; then
    ARGS="$ARGS -host \"$DB_HOST\""
  fi

  if [ -n "$CONNPROPS" ]; then
    ARGS="$ARGS -connprops \"$CONNPROPS\""
  fi

  if [ -z "$OVERRIDE_ARGS" ]; then
    echo "$SCHEMASPY_PATH" "$ARGS" -o "$OUTPUT_PATH" "$ADDITIONAL_ARGS"
  else
    echo $OVERRIDE_ARGS
  fi
}

# =============================================================
# Main Script
# -------------------------------------------------------------
validateEnvironmentSettings

# Attempt to set the driver based on naming convention.
if [ -z "$DB_DRIVER" ]; then
  if [ -e "lib/$DB_TYPE-jdbc.jar" ]; then
    DB_DRIVER="lib/$DB_TYPE-jdbc.jar"
  fi
fi

PARAMS=$(getCmdParameters)
echo $PARAMS

java -jar $PARAMS -all

if [ ! -f "$OUTPUT_PATH/index.html" ]; then
  echo "ERROR - No HTML was output generated."
  exit 1
fi

echo "Starting webserver on port $SERVER_PORT ..."
exec caddy -quic --conf /etc/Caddyfile
# =============================================================