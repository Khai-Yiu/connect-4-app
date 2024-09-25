#! /bin/bash 

STACK_NAME=$1
TEMPLATE=aws/vpc.cfn.yaml
VPCName=$2

aws cloudformation deploy --stack-name "${STACK_NAME}" --template-file "${TEMPLATE}" --parameter-overrides VPCName="${VPCName}"