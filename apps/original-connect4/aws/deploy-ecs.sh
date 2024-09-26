#! /bin/bash 

ECS_STACK=$1
ECR_STACK=$2
VPC_STACK=$3
ELB_STACK=$4
TEMPLATE=aws/ecs.cfn.yaml
ECRRepositoryURI=$(aws cloudformation describe-stacks --stack-name "${ECR_STACK}" | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "RepositoryURI") | .OutputValue')
PublicSubnetId=$(aws cloudformation describe-stacks --stack-name "${VPC_STACK}" | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "PublicSubnetId") | .OutputValue')
VPCId=$(aws cloudformation describe-stacks --stack-name "${VPC_STACK}" | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "VPCId") | .OutputValue')
TargetGroup=$(aws cloudformation describe-stacks --stack-name "${ELB_STACK}" | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "TargetGroup") | .OutputValue')

aws cloudformation deploy --stack-name "${ECS_STACK}" --template-file "${TEMPLATE}" --parameter-overrides ECRRepositoryURI="${ECRRepositoryURI}" PublicSubnetId="${PublicSubnetId}" VPCId="${VPCId}" TargetGroup="${TargetGroup}" --capabilities CAPABILITY_NAMED_IAM