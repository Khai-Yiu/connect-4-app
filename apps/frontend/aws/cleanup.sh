#! /bin/bash

ECS_STACK=ECSWorkshopStack
VPC_STACK=VPCWorkshopStack
ELB_STACK=ELBWorkshopStack
ECR_STACK=ECRWorkshopStack
LOG_GROUP=connect-4-logs
REPOSITORY=workshop-repository

echo "Deleting log group"
aws logs delete-log-group --log-group-name "${LOG_GROUP}"

echo "Deleting ECS stack"
aws cloudformation delete-stack --stack-name "${ECS_STACK}"

echo "Deleting ELB stack"
aws cloudformation delete-stack --stack-name "${ELB_STACK}"

echo "Deleting VPC stack"
aws cloudformation delete-stack --stack-name "${VPC_STACK}"

echo "Emptying and deleting ECR"
aws ecr delete-repository --repository-name "${REPOSITORY}" --force

echo "Deleting ECR stack"
aws cloudformation delete-stack --stack-name "${ECR_STACK}"
