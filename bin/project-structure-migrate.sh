#!/bin/bash


docker-compose down
cp python-backend/.env services/core-api/.env
cp frontend/.env services/core-web/.env
cp frontend-public/.env services/minespace-web/.env
cp microservices/document_manager/backend/.env services/document-manager/backend/.env
cp microservices/nris_api/backend .env services/nris-api/.env
cp microservices/now_etls/.env tasks/now-etls/.env
