#!/bin/bash

NODE=/usr/bin/node
PWD=$( pwd )
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INIT_JS=$SCRIPT_DIR/initnode.js

if [[ $1 =~ ^/.* ]]; then
	JS_FILE=$1
else
	JS_FILE=$PWD/$1
fi

$NODE $INIT_JS $JS_FILE
