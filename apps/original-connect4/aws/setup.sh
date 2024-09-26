#! /bin/bash

ECR_STACK=ECRWorkshopStack

VPC_STACK=VPCWorkshopStack
VPC_NAME=Connect4VPC

ELB_STACK=ELBWorkshopStack

ECS_STACK=ECSWorkshopStack

echo "Creating ECR stack"
bash aws/deploy-ecr.sh "${ECR_STACK}"

REPOSITORY_URI=$(aws cloudformation describe-stacks --stack-name "${ECR_STACK}" | jq -r '.Stacks[0].Outputs[] | select(.OutputKey == "RepositoryURI") | .OutputValue')
ACCOUNT=$(aws sts get-caller-identity | jq -r .Account)
PASSWORD=$(aws ecr get-login-password)

docker login -u AWS --password "${PASSWORD}" "${REPOSITORY_URI}"
docker buildx build -f .devcontainer/Dockerfile -t connect4:latest .
docker tag connect4:latest "${REPOSITORY_URI}:latest"
docker push "${REPOSITORY_URI}:latest"

echo "Creating VPC stack"
bash aws/deploy-vpc.sh "${VPC_STACK}" "${VPC_NAME}"

echo "Creating ELB stack"
bash aws/deploy-elb.sh "${ELB_STACK}" "${VPC_STACK}"

echo "Creating ECS stack"
bash aws/deploy-ecs.sh "${ECS_STACK}" "${ECR_STACK}" "${VPC_STACK}" "${ELB_STACK}"