#!/bin/bash
##################################################
#
#           ** DO NOT EDIT THIS FILE **
#
##################################################
# Version: 2022-12-30
for keyval in  $(grep -E '": [^\{]' ./app/config/base.json | sed -e 's/: /=/' -e "s/\(\,\)$//"); do
    echo 'export ' $keyval && eval export $keyval
    echo $keyval | sed 's/"//g' >> ./docker.env
done;

docker network create api
docker ps -a | grep $dockerBaseName/$name | awk '{ system("docker container stop " $1) }'
docker build . -t $dockerBaseName/$name
if [[ $baseElmer == "true" ]];
then
    docker run --net=$net --hostname $name.$hostname -p $portLocal:$port -d $dockerBaseName/$name
else
    docker run --dns $dns1 --dns $dns2 --net=$net --hostname $name.$hostname -p $portLocal:$port -d $dockerBaseName/$name
fi
sleep 2
curl -X GET http://localhost:$portLocal/
sleep 1

rm ./docker.env

echo ""
echo "####################"
echo "# Container Start:"
echo "####################"
echo ""

docker ps -a | grep $dockerBaseName/$name | awk '{ system("docker container logs " $1) }'

# docker network inspect api
