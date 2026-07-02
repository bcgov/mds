# PGSync

Syncs data from the `mds` Postgres database into Elasticsearch, as defined by `schema.json`. 
On container start, `start.sh` runs `bootstrap` (one-time setup: creates the Elasticsearch index/mapping if missing, DB triggers, replication slot) 
and then starts the long-running `pgsync` daemon.

## ⚠️ Changing `schema.json`? Read this first.

**Elasticsearch field mappings are immutable once an index is created.**
`bootstrap` only creates an index if it does not already exist (`if not indices.exists(index=index): create(...)`) — 
it will **never** alter the mapping of an index that's already there, no matter how many times you redeploy or restart the pod.

This means: if your change to `schema.json` alters the **shape** of a field — for example, changing a relationship's `"variant"` from `scalar` to `object`,
adding/removing a nested join, or changing a column's effective type — simply merging the change and letting it deploy is **not enough**. Every environment
whose index was created before your change will silently keep writing/reading the *old* shape forever, with no error at deploy time. The failure only shows
up later, indirectly, wherever application code reads that field and gets a different shape than it expects.

### What you must do after a mapping-shape change

For each environment (dev, test, prod) whose index was created before your change:

1. Capture a baseline document count for the affected index, so you can confirm no data loss afterward:
   ```
   oc exec <pgsync-pod> -n <namespace> -- python3 -c "
   import os, urllib.request, ssl, json, base64
   ctx = ssl.create_default_context(cafile=os.environ['ELASTICSEARCH_CA_CERTS'])
   auth = base64.b64encode(f\"{os.environ['ELASTICSEARCH_USER']}:{os.environ['ELASTICSEARCH_PASSWORD']}\".encode()).decode()
   host = f\"https://{os.environ['ELASTICSEARCH_HOST']}:{os.environ['ELASTICSEARCH_PORT']}\"
   headers = {'Authorization': f'Basic {auth}'}
   c = urllib.request.Request(f'{host}/<INDEX_NAME>/_count', headers=headers)
   print(json.dumps(json.load(urllib.request.urlopen(c, context=ctx)), indent=2))
   "
   ```

2. Delete **only the affected index** (not the whole cluster, not other indices):
   ```
   oc exec <pgsync-pod> -n <namespace> -- python3 -c "
   import os, urllib.request, ssl, json, base64
   ctx = ssl.create_default_context(cafile=os.environ['ELASTICSEARCH_CA_CERTS'])
   auth = base64.b64encode(f\"{os.environ['ELASTICSEARCH_USER']}:{os.environ['ELASTICSEARCH_PASSWORD']}\".encode()).decode()
   host = f\"https://{os.environ['ELASTICSEARCH_HOST']}:{os.environ['ELASTICSEARCH_PORT']}\"
   req = urllib.request.Request(f'{host}/<INDEX_NAME>', headers={'Authorization': f'Basic {auth}'}, method='DELETE')
   print(json.dumps(json.load(urllib.request.urlopen(req, context=ctx)), indent=2))
   "
   ```

3. Restart the deployment so `start.sh` re-runs `bootstrap` from scratch. With the index gone, bootstrap will recreate it with the current (correct)
   mapping, and the daemon will do a full resync from Postgres (its checkpoint is reset automatically on every bootstrap run, so this is a real, complete resync, not just a resume):
   ```
   oc rollout restart deployment/pgsync -n <namespace>
   oc rollout status deployment/pgsync -n <namespace>
   ```

4. Confirm the new pod's logs show a clean bootstrap (schema tree printed,
   no tracebacks, ends in `Starting pgsync daemon...`), then re-check the
   mapping and count match your baseline.

No Kibana access is required for any of this — the PGSync pod already carries Elasticsearch credentials as env vars (`ELASTICSEARCH_HOST`, `_PORT`, `_USER`,
`_PASSWORD`, `_CA_CERTS`), so the ES REST API can be queried directly via `oc exec` as shown above.

### Do NOT do this

The `pgsync` Python library ships a `pgsync.helper.teardown()` function.
**Never call it.** 
Its defaults are `drop_db=True` and `truncate_db=True` — by default it drops and truncates the actual Postgres database, not just Elasticsearch. 
Nothing in the steps above touches Postgres; only the Elasticsearch index and the Kubernetes deployment are ever touched.

## Incident history

**2026-07:** Prod's `mine_permits` index was created before commits `d20f64c1d`/`ae55dcd87` changed the `mine_guids` relationship from a flat
list of GUID strings (`"variant": "scalar"`) to a list of `{mine_guid, mine_name, mine_no}` objects (`"variant": "object"`). 
Prod's code and config were fully up to date, but the existing index kept its old mapping indefinitely, causing `AttributeError: 'str' object has no attribute
'get'` in core-api whenever a permit search result was processed — which, due to overly-broad exception handling further up the call stack, caused **all**
search result types (not just permits) to come back empty in the "View All" results table. Resolved by deleting and rebuilding the index per the steps
above (zero data loss: document count matched exactly before and after in both test and prod). The exception-handling issue was fixed separately (from the PR that added this Readme) so a future occurrence of this same mapping-drift problem would degrade gracefully (only the affected type missing) rather than blanking every search category.
