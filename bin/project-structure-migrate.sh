#!/bin/bash


cp python-backend/.env services/core-api/.env
cp frontend/.env services/core-web/.env
cp frontend-public/.env services/minespace-web/.env
cp microservices/document_manager/backend/.env services/document-manager/backend/.env
cp microservices/nris_api/backend/.env services/nris-api/backend/.env
cp microservices/now_etls/.env tasks/now-etls/.env

if  [[ $1 = "--delete" ]]; then
    rm -rf python-backend
    rm -rf frontend
    rm -rf frontend-public
    rm -rf microservices
    rm -rf functional-tests
fi