#!/bin/bash

version=$1

[ -f "slk-message-$version.tar" ] && rm "slk-message-$version.tar"
[ -f "slk-message-$version.tar.bz2" ] && rm "slk-message-$version.tar.bz2"

if [ x$1 != x ] ; then
  echo "build v$1"
else
  echo "Incorrect Usage : Arguments mismatch."
  echo "Usage:"
  echo "  ./build-image.sh 1.0.0"
  exit 2
fi

echo "[1/4] rmi old image"
sudo docker rmi -f slk-message:$1
echo "[2/4] build image"
sudo docker build -t slk-message:$1 .
echo "[3/4] export image"
sudo docker save slk-message:$version > slk-message-$version.tar
echo "[4/4] compression image"
tar zcvf slk-message-"$version".tar.bz2 slk-message-"$version".tar
echo "[info] build success"


