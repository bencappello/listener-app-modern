#!/bin/bash

# Set the Python path to include the backend directory
export PYTHONPATH=$PWD:$PYTHONPATH

# Run pytest with passed arguments
pytest "$@" 