#! /bin/bash

ELB_STACK=$1
VPC_STACK=$2
TEMPLATE=aws/elb.cfn.yaml
PublicSubnetId=$(aws cloudformation describe-stacks --stack-name "${VPC_STACK}" | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "PublicSubnetId") | .OutputValue')
PrivateSubnetId=$(aws cloudformation describe-stacks --stack-name "${VPC_STACK}" | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "PrivateSubnetId") | .OutputValue')
VPCId=$(aws cloudformation describe-stacks --stack-name "${VPC_STACK}" | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "VPCId") | .OutputValue')

aws cloudformation deploy --stack-name "${ELB_STACK}" --template-file "${TEMPLATE}" --parameter-overrides VPCId="${VPCId}" PublicSubnetId="${PublicSubnetId}" PrivateSubnetId="${PrivateSubnetId}" 