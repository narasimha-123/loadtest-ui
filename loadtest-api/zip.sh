#!/bin/bash
name=$1
currD=$(pwd)
cd results/${name}/
zip -r ${currD}/results/${name}.zip *
cd $currD
sleep 5