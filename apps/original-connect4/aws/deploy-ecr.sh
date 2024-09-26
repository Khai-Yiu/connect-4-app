#! /bin/bash 

STACK_NAME=$1
TEMPLATE=aws/ecr.cfn.yaml
CallingUserARN=$(aws sts get-caller-identity | jq -r .Account)

aws cloudformation deploy --stack-name "${STACK_NAME}" --template-file "${TEMPLATE}" --parameter-overrides CallingUserARN="${CallingUserARN}"