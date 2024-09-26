#! /bin/bash

STACK_NAME="Connect4WebsiteStack"
TEMPLATE="connect-4.yaml"

aws cloudformation deploy --stack-name "${STACK_NAME}" --template-file "${TEMPLATE}" --capabilities CAPABILITY_IAM
