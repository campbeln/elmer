#!/bin/bash
##################################################
#
#           ** DO NOT EDIT THIS FILE **
#
##################################################
# Version: 2023-05-07

NEWLINE=$'\n'

# Loop through arguments and process them
#     See: https://pretzelhands.com/posts/command-line-flags/ also https://www.baeldung.com/linux/use-command-line-arguments-in-bash-script
for arg in "$@"
do
    case $arg in
        -p=*|--port=*)
        flagPort="${arg#*=}"
        shift # Remove --port= from processing
        ;;
        -e=*|--env=*)
        flagEnv="${arg#*=}"
        shift # Remove --env= from processing
        ;;
        -a|--all)
        flagSync=1
        flagRebuild=1
        flagLogs=1
        flagVars=1
        shift # Remove --rebuild from processing
        ;;
        -s|--sync)
        flagSync=1
        shift # Remove --sync from processing
        ;;
        -u|--update)
        flagUpdate=1
        shift # Remove --update from processing
        ;;
        -r|--rebuild)
        flagRebuild=1
        shift # Remove --rebuild from processing
        ;;
        -l|--logs)
        flagLogs=1
        shift # Remove --logs from processing
        ;;
        -v|--vars)
        flagVars=1
        shift # Remove --logs from processing
        ;;
        -n|--network)
        flagNetwork=1
        shift # Remove --network from processing
        ;;
        -t|--test)
        flagTest=1
        shift # Remove --test from processing
        ;;
        --config=*)
        flagConfigEnv="${arg#*=}"
        shift # Remove --config from processing
        ;;
        #-x|--xxx)
        #flagXXX="$2"
        #shift # Remove argument name from processing
        #shift # Remove argument value from processing
        #;;
        *)
        flagOthers+=("$1")
        shift # Remove generic argument from processing
        ;;
    esac
done


# Use Javascript (and $ish) to format the base.json and requested env.json into a .obj.flatten'd JSON file so it can be exposed to the shell and Docker, returning the processed $flagEnv into the shell variable
flagEnv=$(node -e " \
    let ish = require('./libs/ish/ish.type.enum.js')(require('./libs/ish/ish.js')), \
        fs = require('fs'), \
        sEnv = ( ['dev', 'prod'].indexOf('$flagEnv') === -1 ? 'dev' : '$flagEnv' ),
        oConfig = ish.type.obj.flatten( \
            ish.extend( \
                JSON.parse(fs.readFileSync('./app/config/base.json', 'utf8')), \
                JSON.parse(fs.readFileSync('./app/config/' + sEnv + '.json', 'utf8')) \
            ) \
        ) \
    ; \
    fs.writeFileSync('./app/config/config.json', JSON.stringify(oConfig)); \
    console.log(sEnv); \
")

# Import the config.json variables into this script via export and into docker.env
vars=""
for keyval in  $(grep -E '": [^\{]' ./app/config/config.json | sed -e 's/: /=/' -e "s/\(\,\)$//"); do
    # echo export $keyval
    eval export $keyval
    echo $keyval | sed 's/"//g' >> ./docker.env

    vars+="${keyval}${NEWLINE}"
done;
rm ./app/config/config.json



echo "########################################"
echo "# ${name} => ${flagEnv}"
echo "########################################"



# Setup
if [ "$flagConfigEnv" = "base" ] || [ "$flagConfigEnv" = "child" ]; # [ "$flagConfigEnv" = "base" -o "$flagConfigEnv" = "child" ];
then
    if [ -d "./app/childapi" ];
    then
        echo "# Configuring Version: ${flagConfigEnv}"

        if [ "$flagConfigEnv" = "base" ];
        then
            rm -R ./app/childapi
        fi

        if [ "$flagConfigEnv" = "child" ];
        then
            rm -R ./app/middleware
            rm ./app/routes/elmer.js
            rm ./app/routes/login.js
            rm ./app/app-ex.js
            rm ./app/config/base.json

            mv ./app/childapi/app-ex.js ./app/app-ex.js
            mv ./app/childapi/config/base.js ./app/config/base.json
            mv ./app/childapi/routes/example.js ./app/routes/example.js
            rm -R ./app/childapi
        fi
    else
        echo "# Configuring Version: ERROR - This directory has already been configured!"
    fi
else
    # echo "# Invalid Env: ${flagConfigEnv}"
    :
fi


# Vars
if [[ $flagVars == 1 ]];
then
    echo "####################"
    echo "# Vars"
    echo "####################"
    echo "${vars}"
fi


# Sync
if [[ $flagSync == 1 ]];
then
    echo "####################"
    echo "# Syncing..."
    echo "####################"

    cp -R ../elmer/app/middleware/* ./app/middleware/
    cp ../elmer/app/routes/_routes.js ./app/routes/
    cp ../elmer/app/_app.js ./app/
    cp -R ../elmer/libs/* ./libs/
    cp ../elmer/_index.js .
    cp ../elmer/_tools.sh .

    flagUpdate=1
fi


# Update
if [[ $flagUpdate == 1 ]];
then
    echo "####################"
    echo "# Updating..."
    echo "####################"
    echo "# NOTE: Please run 'sudo npm install npm@latest -g' to clear any NPM-related errors that may appear below."

    # npm update
    # npm install npm@latest -g
    npm update --save/--save-dev # https://jh3y.medium.com/how-to-update-all-npm-packages-in-your-project-at-once-17a8981860ea
    npm install
    npm audit fix --force
fi


# Rebuild
if [[ $flagRebuild == 1 ]];
then
    echo "####################"
    echo "# Rebuilding..."
    echo "####################"

    # Docker
    docker network inspect api >/dev/null 2>&1 || docker network create api   # https://stackoverflow.com/a/53052379
    docker ps -a | grep $dockerBaseName/$name | awk '{ system("docker container stop " $1) }'
    docker build . -t $dockerBaseName/$name

    # Don't include dns definitions for $baseElmer
    if [[ $baseElmer == "true" ]];
    then
        docker run --net=$net --hostname $name.$hostname -p $portLocal:$port -d $dockerBaseName/$name
    else
        docker run --dns $dns1 --dns $dns2 --net=$net --hostname $name.$hostname -p $portLocal:$port -d $dockerBaseName/$name
    fi

    # Force the $flagLogs below and sleep to allow the logs to register
    flagLogs=1
    sleep 2
fi


# Log
if [[ $flagLogs == 1 ]];
then
    echo "####################"
    echo "# Logs"
    echo "####################"

    docker ps -a | grep $dockerBaseName/$name | awk '{ system("docker container logs " $1) }'
fi


# Network
if [[ $flagNetwork == 1 ]];
then
    echo "####################"
    echo "# Docker Network"
    echo "####################"

    docker network inspect api
fi


# Test
if [[ $flagTest == 1 ]];
then
    echo "Test successful; $flagOthers"
fi


# Remove the Docker environment file
sleep 1
rm ./docker.env
