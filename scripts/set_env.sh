#!/bin/bash

# Script to set the environment configuration

# Usage: ./scripts/set_env.sh [development|test|production]

if [ -z "$1" ]; then
    echo "Usage: $0 [development|test|production]"
    exit 1
fi

ENV_TYPE=$1

if [ "$ENV_TYPE" != "development" ] && [ "$ENV_TYPE" != "test" ] && [ "$ENV_TYPE" != "production" ]; then
    echo "Invalid environment type. Use one of: development, test, production"
    exit 1
fi

# Copy the environment file
echo "Setting environment to $ENV_TYPE"
cp ".env.$ENV_TYPE" .env

echo "Environment set to $ENV_TYPE" 