##################################################
#
#            ** BASE VERSION **
#
##################################################
# Version: 2022-10-30
for keyval in  $(grep -E '": [^\{]' ./app/config/base.json | sed -e 's/: /=/' -e "s/\(\,\)$//"); do
    echo 'export ' $keyval && eval export $keyval
    echo $keyval | sed 's/"//g' >> ./docker.env
done;

docker build . -t $dockerBaseName/$dockerBaseName
#docker run --dns $dns1 --dns $dns2 --net=$net --hostname $name.$hostname -p $portLocal:$port -d $dockerBaseName/$name
docker run --net=$net --hostname $name.$hostname -p $portLocal:$port -d $dockerBaseName/$name
sleep 2
curl -X GET http://localhost:$portLocal/
sleep 1

rm ./docker.env

# docker network inspect api
