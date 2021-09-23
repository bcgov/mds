# Configuration settings.
export POSTGRESQL_MAX_CONNECTIONS=${POSTGRESQL_MAX_CONNECTIONS:-100}
export POSTGRESQL_MAX_PREPARED_TRANSACTIONS=${POSTGRESQL_MAX_PREPARED_TRANSACTIONS:-0}

# Perform auto-tuning based on the container cgroups limits (only when the
# limits are set).
# Users can still override this by setting the POSTGRESQL_SHARED_BUFFERS
# and POSTGRESQL_EFFECTIVE_CACHE_SIZE variables.
if [[ "${NO_MEMORY_LIMIT:-}" == "true" || -z "${MEMORY_LIMIT_IN_BYTES:-}" ]]; then
    export POSTGRESQL_SHARED_BUFFERS=${POSTGRESQL_SHARED_BUFFERS:-32MB}
    export POSTGRESQL_EFFECTIVE_CACHE_SIZE=${POSTGRESQL_EFFECTIVE_CACHE_SIZE:-128MB}
else
    # Use 1/4 of given memory for shared buffers
    shared_buffers_computed="$(($MEMORY_LIMIT_IN_BYTES/1024/1024/4))MB"
    # Setting effective_cache_size to 1/2 of total memory would be a normal conservative setting,
    effective_cache="$(($MEMORY_LIMIT_IN_BYTES/1024/1024/2))MB"
    export POSTGRESQL_SHARED_BUFFERS=${POSTGRESQL_SHARED_BUFFERS:-$shared_buffers_computed}
    export POSTGRESQL_EFFECTIVE_CACHE_SIZE=${POSTGRESQL_EFFECTIVE_CACHE_SIZE:-$effective_cache}
fi

export POSTGRESQL_RECOVERY_FILE=$HOME/openshift-custom-recovery.conf
export POSTGRESQL_CONFIG_FILE=$HOME/openshift-custom-postgresql.conf

postinitdb_actions=

psql_identifier_regex='^[a-zA-Z_][a-zA-Z0-9_]*$'
psql_password_regex='^[a-zA-Z0-9_~!@#$%^&*()-=<>,.?;:|]+$'

# match . files when moving userdata below
shopt -s dotglob
# extglob enables the !(userdata) glob pattern below.
shopt -s extglob

function usage() {
  if [ $# == 1 ]; then
    echo >&2 "error: $1"
  fi

  cat >&2 <<EOF
You must either specify the following environment variables:
  POSTGRESQL_USER (regex: '$psql_identifier_regex')
  POSTGRESQL_PASSWORD (regex: '$psql_password_regex')
  POSTGRESQL_DATABASE (regex: '$psql_identifier_regex')
Or the following environment variable:
  POSTGRESQL_ADMIN_PASSWORD (regex: '$psql_password_regex')
Or both.
Optional settings:
  POSTGRESQL_MAX_CONNECTIONS (default: 100)
  POSTGRESQL_MAX_PREPARED_TRANSACTIONS (default: 0)
  POSTGRESQL_SHARED_BUFFERS (default: 32MB)

For more information see /usr/share/container-scripts/postgresql/README.md
within the container or visit https://github.com/sclorg/postgresql-container.
EOF
  exit 1
}

function check_env_vars() {
  if [[ -v POSTGRESQL_USER || -v POSTGRESQL_PASSWORD || -v POSTGRESQL_DATABASE ]]; then
    # one var means all three must be specified
    [[ -v POSTGRESQL_USER && -v POSTGRESQL_PASSWORD && -v POSTGRESQL_DATABASE ]] || usage
    [[ "$POSTGRESQL_USER"     =~ $psql_identifier_regex ]] || usage
    [[ "$POSTGRESQL_PASSWORD" =~ $psql_password_regex   ]] || usage
    [[ "$POSTGRESQL_DATABASE" =~ $psql_identifier_regex ]] || usage
    [ ${#POSTGRESQL_USER}     -le 63 ] || usage "PostgreSQL username too long (maximum 63 characters)"
    [ ${#POSTGRESQL_DATABASE} -le 63 ] || usage "Database name too long (maximum 63 characters)"
    postinitdb_actions+=",simple_db"
  fi

  if [ -v POSTGRESQL_ADMIN_PASSWORD ]; then
    [[ "$POSTGRESQL_ADMIN_PASSWORD" =~ $psql_password_regex ]] || usage
    postinitdb_actions+=",admin_pass"
  fi

  case ",$postinitdb_actions," in
    *,admin_pass,*|*,simple_db,*) ;;
    *) usage ;;
  esac

}

# Make sure env variables don't propagate to PostgreSQL process.
function unset_env_vars() {
  unset POSTGRESQL_{DATABASE,USER,PASSWORD,ADMIN_PASSWORD}
}

# postgresql_master_addr lookups the 'postgresql-master' DNS and get list of the available
# endpoints. Each endpoint is a PostgreSQL container with the 'master' PostgreSQL running.
function postgresql_master_addr() {
  local service_name=${POSTGRESQL_MASTER_SERVICE_NAME:-postgresql-master}
  local endpoints=$(dig ${service_name} A +search | grep ";${service_name}" | cut -d ';' -f 2 2>/dev/null)
  # FIXME: This is for debugging (docker run)
  if [ -v POSTGRESQL_MASTER_IP ]; then
    endpoints=${POSTGRESQL_MASTER_IP:-}
  fi
  if [ -z "$endpoints" ]; then
    >&2 echo "Failed to resolve PostgreSQL master IP address"
    exit 3
  fi
  echo -n "$(echo $endpoints | cut -d ' ' -f 1)"
}

# New config is generated every time a container is created. It only contains
# additional custom settings and is included from $PGDATA/postgresql.conf.
function generate_postgresql_config() {
  envsubst \
      < "${CONTAINER_SCRIPTS_PATH}/openshift-custom-postgresql.conf.template" \
      > "${POSTGRESQL_CONFIG_FILE}"

  if [ "${ENABLE_REPLICATION}" == "true" ]; then
    envsubst \
        < "${CONTAINER_SCRIPTS_PATH}/openshift-custom-postgresql-replication.conf.template" \
        >> "${POSTGRESQL_CONFIG_FILE}"
  fi
}

function generate_postgresql_recovery_config() {
  envsubst \
      < "${CONTAINER_SCRIPTS_PATH}/openshift-custom-recovery.conf.template" \
      > "${POSTGRESQL_RECOVERY_FILE}"
}

# Generate passwd file based on current uid
function generate_passwd_file() {
  export USER_ID=$(id -u)
  export GROUP_ID=$(id -g)
  grep -v ^postgres /etc/passwd > "$HOME/passwd"
  echo "postgres:x:${USER_ID}:${GROUP_ID}:PostgreSQL Server:${HOME}:/bin/bash" >> "$HOME/passwd"
  export LD_PRELOAD=libnss_wrapper.so
  export NSS_WRAPPER_PASSWD=${HOME}/passwd
  export NSS_WRAPPER_GROUP=/etc/group
}

initdb_wrapper ()
{
  # Initialize the database cluster with utf8 support enabled by default.
  # This might affect performance, see:
  # https://www.postgresql.org/docs/9.6/static/locale.html
  LANG=${LANG:-en_US.utf8} "$@"
}

function initialize_database() {
  initdb_wrapper initdb --username=${PGUSER}

  # PostgreSQL configuration.
  cat >> "$PGDATA/postgresql.conf" <<EOF

# Custom OpenShift configuration:
include '${POSTGRESQL_CONFIG_FILE}'
EOF

  # Access control configuration.
  # FIXME: would be nice-to-have if we could allow connections only from
  #        specific hosts / subnet
  cat >> "$PGDATA/pg_hba.conf" <<EOF

#
# Custom OpenShift configuration starting at this point.
#

# Allow connections from all hosts.
host all all all md5

# Allow replication connections from all hosts.
host replication all all md5
EOF
}

function create_users() {
  if [[ ",$postinitdb_actions," = *,simple_db,* ]]; then
    createuser "$POSTGRESQL_USER"
    createdb --owner="$POSTGRESQL_USER" "$POSTGRESQL_DATABASE"
  fi

  if [ -v POSTGRESQL_MASTER_USER ]; then
    createuser "$POSTGRESQL_MASTER_USER"
  fi
}

function create_fdw() {
  if [[ -v FDW_NAME && -v FDW_FOREIGN_SERVER && -v FDW_USER && -v FDW_PASS && -v FDW_FOREIGN_SCHEMA && -v FDW_SCHEMA ]]; then
    echo Updating FDW settings...

	psql -d $POSTGRESQL_DATABASE <<EOF
	BEGIN;
	CREATE EXTENSION IF NOT EXISTS oracle_fdw;
    DROP SERVER IF EXISTS ${FDW_NAME} CASCADE;
    CREATE SERVER $FDW_NAME FOREIGN DATA WRAPPER oracle_fdw OPTIONS (dbserver '${FDW_FOREIGN_SERVER}');
    DROP USER MAPPING IF EXISTS FOR public SERVER ${FDW_NAME};
    CREATE USER MAPPING FOR public SERVER ${FDW_NAME} OPTIONS (user '${FDW_USER}', password '${FDW_PASS}');
    DROP SCHEMA IF EXISTS ${FDW_SCHEMA};										
    CREATE SCHEMA ${FDW_SCHEMA};
    IMPORT FOREIGN SCHEMA "${FDW_FOREIGN_SCHEMA}" FROM SERVER ${FDW_NAME} INTO ${FDW_SCHEMA};
    DROP ROLE IF EXISTS fdw_reader;
    CREATE ROLE fdw_reader;
    GRANT USAGE ON SCHEMA ${FDW_SCHEMA} TO fdw_reader;
    GRANT SELECT ON ALL TABLES IN SCHEMA ${FDW_SCHEMA} TO fdw_reader;
    GRANT fdw_reader to "${POSTGRESQL_USER}";
	COMMIT;
EOF

    PSQL_EXIT_STATUS=$?
    if [ $PSQL_EXIT_STATUS != 0 ]; then
      echo "psql failed while trying configure oracle_fdw." 
    else
	  echo "success - oracle_fdw is installed."
      touch $PGDATA/fdw.conf   
    fi
  else
    cat >&2 <<EOF
Foreign Data Wrapper environment variables not found.  Set the following variables to enable FDW.
  FDW_FOREIGN_SCHEMA (Oracle schema to get data from)
  FDW_FOREIGN_SERVER (The Oracle server reference, for example //servername.bcgov/schemaname.bcgov')
  FDW_NAME (The name of the foreign data wrapper)
  FDW_PASS (Oracle password)
  FDW_SCHEMA (Postgres schema to send data to)
  FDW_USER (Oracle username)
  
EOF
  
  fi
}

function create_postgis_pgcrypto() {
  echo Updating extensions...

  if test "$POSTGIS_EXTENSION" = "N"; then
    echo ".. skipping postgis extension."
  else
    psql -d $POSTGRESQL_DATABASE -c "CREATE EXTENSION IF NOT EXISTS postgis;COMMIT;"
    echo ".. enabled postgis extension."
  fi

  if test "$PGCRYPTO_EXTENSION" = "N"; then
    echo ".. skipping pgcrypto extension."
  else
    psql -d $POSTGRESQL_DATABASE -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;COMMIT;"
    echo ".. enabled pgcrypto extension."
  fi

  PSQL_EXIT_STATUS=$?
  if [ $PSQL_EXIT_STATUS != 0 ]; then
    echo "psql failed while trying create extensions postgis and pgcrypto." 
  else
    echo "success - extensions processed in default database, as per build arguments."
  fi
}


function set_passwords() {
  if [[ ",$postinitdb_actions," = *,simple_db,* ]]; then
    psql --command "ALTER USER \"${POSTGRESQL_USER}\" WITH ENCRYPTED PASSWORD '${POSTGRESQL_PASSWORD}';"
  fi

  if [ -v POSTGRESQL_MASTER_USER ]; then
    psql --command "ALTER USER \"${POSTGRESQL_MASTER_USER}\" WITH REPLICATION;"
    psql --command "ALTER USER \"${POSTGRESQL_MASTER_USER}\" WITH ENCRYPTED PASSWORD '${POSTGRESQL_MASTER_PASSWORD}';"
  fi

  if [ -v POSTGRESQL_ADMIN_PASSWORD ]; then
    psql --command "ALTER USER \"postgres\" WITH ENCRYPTED PASSWORD '${POSTGRESQL_ADMIN_PASSWORD}';"
  fi
}

function set_pgdata ()
{
  # backwards compatibility case, we used to put the data here,
  # move it into our new expected location (userdata)
  if [ -e ${HOME}/data/PG_VERSION ]; then
    mkdir -p "${HOME}/data/userdata"
    pushd "${HOME}/data"
    # move everything except the userdata directory itself, into the userdata directory.
    mv !(userdata) "userdata"
    popd
  else 
    # create a subdirectory that the user owns
    mkdir -p "${HOME}/data/userdata"
  fi
  export PGDATA=$HOME/data/userdata
  # ensure sane perms for postgresql startup
  chmod 700 "$PGDATA"
}

function wait_for_postgresql_master() {
  while true; do
    master_fqdn=$(postgresql_master_addr)
    echo "Waiting for PostgreSQL master (${master_fqdn}) to accept connections ..."
    if [ -v POSTGRESQL_ADMIN_PASSWORD ]; then
      PGPASSWORD=${POSTGRESQL_ADMIN_PASSWORD} psql "postgresql://postgres@${master_fqdn}" -c "SELECT 1;" && return 0
    else
      PGPASSWORD=${POSTGRESQL_PASSWORD} psql "postgresql://${POSTGRESQL_USER}@${master_fqdn}/${POSTGRESQL_DATABASE}" -c "SELECT 1;" && return 0
    fi
    sleep 1
  done
}


run_pgupgrade ()
(
  optimized=false
  old_raw_version=${POSTGRESQL_PREV_VERSION//\./}
  new_raw_version=${POSTGRESQL_VERSION//\./}

  if test "$old_raw_version" = 92; then
    old_collection=postgresql92
  else
    old_collection=rh-postgresql$old_raw_version
  fi

  old_pgengine=/opt/rh/$old_collection/root/usr/bin
  new_pgengine=/opt/rh/rh-postgresql${new_raw_version}/root/usr/bin
  PGDATA_new="${PGDATA}-new"

  printf >&2 "\n==========  \$PGDATA upgrade: %s -> %s  ==========\n\n" \
             "$POSTGRESQL_PREV_VERSION" \
             "$POSTGRESQL_VERSION"

  info_msg () { printf >&2 "\n===>  $*\n\n" ;}

  # pg_upgrade writes logs to cwd, so go to the persistent storage first
  cd "$HOME"/data

  # disable this because of scl_source, 'set +u' just makes the code ugly
  # anyways
  set +u

  # we need to have the old SCL enabled, otherwise the $old_pgengine is not
  # working.  The scl_source script doesn't pay attention to non-zero exit
  # statuses, so use 'set +e'.
  set +e
  source scl_source enable $old_collection
  set -e

  case $POSTGRESQL_UPGRADE in
    copy) # we accept this
      ;;
    hardlink)
      optimized=:
      ;;
    *)
      echo >&2 "Unsupported value: \$POSTGRESQL_UPGRADE=$POSTGRESQL_UPGRADE"
      false
      ;;
  esac

  # Ensure $PGDATA_new doesn't exist yet, so we can immediately remove it if
  # there's some problem.
  test ! -e "$PGDATA_new"

  # initialize the database
  info_msg "Initialize new data directory; we will migrate to that."
  initdb_cmd=( initdb_wrapper "$new_pgengine"/initdb "$PGDATA_new" )
  eval "\${initdb_cmd[@]} ${POSTGRESQL_UPGRADE_INITDB_OPTIONS-}" || \
    { rm -rf "$PGDATA_new" ; false ; }

  upgrade_cmd=(
      "$new_pgengine"/pg_upgrade
      "--old-bindir=$old_pgengine"
      "--new-bindir=$new_pgengine"
      "--old-datadir=$PGDATA"
      "--new-datadir=$PGDATA_new"
  )

  # Dangerous --link option, we loose $DATADIR if something goes wrong.
  ! $optimized || upgrade_cmd+=(--link)

  # User-specififed options for pg_upgrade.
  eval "upgrade_cmd+=(${POSTGRESQL_UPGRADE_PGUPGRADE_OPTIONS-})"

  # the upgrade
  info_msg "Starting the pg_upgrade process."

  # Once we stop support for PostgreSQL 9.4, we don't need
  # REDHAT_PGUPGRADE_FROM_RHEL hack as we don't upgrade from 9.2 -- that means
  # that we don't need to fiddle with unix_socket_director{y,ies} option.
  REDHAT_PGUPGRADE_FROM_RHEL=1 \
  "${upgrade_cmd[@]}" || { rm -rf "$PGDATA_new" && false ; }

  # Move the important configuration and remove old data.  This is highly
  # careless, but we can't do more for this over-automatized process.
  info_msg "Swap the old and new PGDATA and cleanup."
  mv "$PGDATA"/*.conf "$PGDATA_new"
  rm -rf "$PGDATA"
  mv "$PGDATA_new" "$PGDATA"

  info_msg "Upgrade DONE."
)


# Run right after container startup, when the data volume is already initialized
# (not initialized by this container run) and thus there exists a chance that
# the data was generated by incompatible PostgreSQL major version.
try_pgupgrade ()
{
  local versionfile="$PGDATA"/PG_VERSION version upgrade_available

  # This file always exists.
  test -f "$versionfile"
  version=$(cat "$versionfile")

  # If we don't support pg_upgrade, skip.
  test -z "${POSTGRESQL_PREV_VERSION-}" && return 0

  if test "$POSTGRESQL_VERSION" = "$version"; then
      # No need to call pg_upgrade.

      # Mistakenly requests upgrade?  If not, just start the DB.
      test -z "${POSTGRESQL_UPGRADE-}" && return 0

      # Make _sure_ we have this safety-belt here, otherwise our users would
      # just specify '-e POSTGRESQL_UPGRADE=hardlink' permanently, even for
      # re-deployment cases when upgrade is not needed.  Setting such
      # unfortunate default could mean that pg_upgrade might (after some user
      # mistake) migrate (or even destruct, especially with --link) the old data
      # directory with limited rollback options, if any.
      echo >&2
      echo >&2 "== WARNING!! =="
      echo >&2 "PostgreSQL server version matches the datadir PG_VERSION."
      echo >&2 "The \$POSTGRESQL_UPGRADE makes no sense and you probably"
      echo >&2 "made some mistake, keeping the variable set you might"
      echo >&2 "risk a data loss in future!"
      echo >&2 "==============="
      echo >&2

      # Exit here, but allow _really explicit_ foot-shot.
      ${POSTGRESQL_UPGRADE_FORCE-false}
      return 0
  fi

  # At this point in code we know that PG_VERSION doesn't match the PostgreSQL
  # server major version;  this might mean that user either (a) mistakenly
  # deploys from a bad image, or (b) user wants to perform upgrade.  For the
  # upgrade we require explicit request -- just to avoid disasters in (a)-cases.

  if test -z "${POSTGRESQL_UPGRADE-}"; then
    echo >&2 "Incompatible data directory.  This container image provides"
    echo >&2 "PostgreSQL '$POSTGRESQL_VERSION', but data directory is of"
    echo >&2 "version '$version'."
    echo >&2
    echo >&2 "This image supports automatic data directory upgrade from"
    echo >&2 "'$POSTGRESQL_PREV_VERSION', please _carefully_ consult image documentation"
    echo >&2 "about how to use the '\$POSTGRESQL_UPGRADE' startup option."
    # We could wait for postgresql startup failure (there's no risk of data dir
    # corruption), but fail rather early.
    false
  fi

  # We support pg_upgrade process only from previous version of this container
  # (upgrade to N to N+1 is possible, so e.g. 9.5 to 9.6).
  if test "$POSTGRESQL_PREV_VERSION" != "$version"; then
    echo >&2 "With this container image you can only upgrade from data directory"
    echo >&2 "of version '$POSTGRESQL_PREV_VERSION', not '$version'."
    false
  fi

  run_pgupgrade
}
