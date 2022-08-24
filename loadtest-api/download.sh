#!/bin/bash
name=$1
currD=$(pwd)
echo $currD
scp -r opc@100.73.59.118:/home/opc/loadTestUI/results/${name} ${currD}/results/
echo "${name}.zip"
cd ${currD}/results/${name}/
zip -r ${currD}/results/${name}.zip *
cd $currD
sleep 5