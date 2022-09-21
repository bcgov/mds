# MDS Project - Discord -> Sysdig Webhook
# Default Environments
# -include ./.env

# export $(shell sed 's/=.*//' ./.env)

# Project
export PROJECT := mds

# Runtime and application Environments specific variable
export ENV_NAME ?= prod


# Git
export COMMIT_SHA:=$(shell git rev-parse --short=7 HEAD)
export LAST_COMMIT_MESSAGE:=$(shell git log -1 --oneline --decorate=full --no-color --format="%h, %cn, %f, %D" | sed 's/->/:/')

# TF Token
export TFCTK:=$(shell cat ~/.terraform.d/credentials.tfrc.json | jq -r '.credentials."app.terraform.io".token')

# AWS Environments variables
export AWS_REGION ?= ca-central-1
NAMESPACE = $(PROJECT)-$(ENV_NAME)
APP_SRC_BUCKET = $(NAMESPACE)-app

# Terraform variables
TERRAFORM_DIR = terraform
# export BOOTSTRAP_ENV=terraform/bootstrap

define TFVARS_DATA
target_env = "$(ENV_NAME)"

endef
export TFVARS_DATA

# Terraform cloud backend config variables
# LZ2 
LZ2_PROJECT = bth36g

# Terraform Cloud backend config variables
define TF_BACKEND_CFG
workspaces { name = "$(LZ2_PROJECT)-$(ENV_NAME)" }
hostname     = "app.terraform.io"
organization = "bcgov"
endef
export TF_BACKEND_CFG

	
# ===================================
# Terraform commands
# ===================================

write-config-tf:
	@echo "$$TFVARS_DATA" > $(TERRAFORM_DIR)/.auto.tfvars
	@echo "$$TF_BACKEND_CFG" > $(TERRAFORM_DIR)/backend.hcl

init: write-config-tf
	# Initializing the terraform environment
	@terraform -chdir=$(TERRAFORM_DIR) init -input=false \
		-reconfigure \
		-backend-config=backend.hcl -upgrade

plan: init
	# Creating all AWS infrastructure.
	@terraform -chdir=$(TERRAFORM_DIR) plan -no-color

apply: init 
	# Creating all AWS infrastructure.
	@terraform -chdir=$(TERRAFORM_DIR) apply -auto-approve -input=false

destroy: init
	@terraform -chdir=$(TERRAFORM_DIR) destroy

runs: 
	./terraform/scripts/runs.sh $(TFCTK) $(ENV_NAME)
