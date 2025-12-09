mine_mapping = {
    "mappings": {
        "properties": {
            "mine_guid": { "type": "keyword" },
            "mine_name": { "type": "text", "analyzer": "standard" },
            "mine_no": { "type": "keyword" },
            "mms_alias": { "type": "text" }
        }
    }
}

party_mapping = {
    "mappings": {
        "properties": {
            "party_guid": { "type": "keyword" },
            "first_name": { "type": "text" },
            "party_name": { "type": "text" },
            "email": { "type": "keyword" },
            "phone_no": { "type": "keyword" },
            "name": { "type": "text" } # Concatenated name
        }
    }
}

permit_mapping = {
    "mappings": {
        "properties": {
            "permit_guid": { "type": "keyword" },
            "permit_no": { "type": "keyword" }
        }
    }
}

document_mapping = {
    "mappings": {
        "properties": {
            "document_guid": { "type": "keyword" },
            "document_name": { "type": "text" },
            "mine_guid": { "type": "keyword" },
            "upload_date": { "type": "date" }
        }
    }
}
