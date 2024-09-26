#! bin/bash

ACCOUNT_ID=$(aws sts get-caller-identity | jq .Account)
PASSWORD=$(aws ecr get-login-password)
ARN=$(aws cloudformation describe-stacks --stack-name ECRWorkshopStack | jq .Stacks[0].Outputs[0].OutputValue)

docker login -u AWS --password "${PASSWORD}" "${ARN}"