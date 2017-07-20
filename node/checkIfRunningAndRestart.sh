#!/usr/bin/env bash
set -x
export a=`curl -sL -w "%{http_code}\\n" "http://localhost:3100/api/ping" -o /dev/null`
echo $a

if [ $a = "200" ]; then
    echo "service is up!"
else
    cd $1
    nohup node server.js 2>&1 &
fi
