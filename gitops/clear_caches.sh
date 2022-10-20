#!/bin/bash
set -e 

# Run this to clear 100 cache entries in GHA

GH_TOKEN=${1?"Enter GitHub Actions Token !"}

curl \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Authorization: token $GH_TOKEN" \
    https://api.github.com/repos/bcgov/mds/actions/caches?per_page=100 | jq '.["actions_caches"][] | .id' \
    | 
    while IFS= read -r cache_id; do
        # Iterate through listed cache keys and remove their associated caches
        curl \
            -X DELETE \
            -H "Accept: application/vnd.github.v3+json" \
            -H "Authorization: token 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" \
            https://api.github.com/repos/bcgov/mds/actions/caches/$cache_id

    done
