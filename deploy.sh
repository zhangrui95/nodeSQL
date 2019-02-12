#!/bin/bash

version=$1

if [ x$1 != x ] ; then
  echo "build v$1"
else
  echo "Incorrect Usage : Arguments mismatch."
  echo "Usage:"
  echo "  ./deploy-image.sh 1.0.0"
  exit 2
fi

echo "[1/4] rmi old image"
sudo docker rmi -f slk-message:$1
echo "[2/4] unzip image"
tar xvf slk-message-"$version".tar.bz2
echo "[3/4] load image"
sudo docker load --input slk-message-$version.tar
echo "[4/4] start image"
sudo docker run --restart=always --name slk-message -d -p 8720:8720 -p 8722:8722 -p 8724:8724  slk-message:$version
echo "[info] deploy success"



