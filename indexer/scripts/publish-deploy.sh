#!/bin/bash

while getopts p:o flag
do
    case "${flag}" in
        p) PROJECTNAME=${OPTARG};;
        o) ORG=${OPTARG};;
        *) echo "Usage: $0 [-p projectname] [-o org] [-e endpoint]" && exit 1;;
    esac
done

IPFSCID=$(npx subql publish -o -f .)

echo $IPFSCID

# npx subql deployment:deploy -d --ipfsCID="$IPFSCID" --projectName="${PROJECTNAME}" --org="${ORG%/*}" --endpoint="https://indexing.onfinality.io"