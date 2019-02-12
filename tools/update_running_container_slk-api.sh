#!/bin/bash

sudo docker exec -it slk-message pm2 stop slk-message
sudo docker cp slk-api/ slk-message:/opt/hylink/slk-message/
sudo docker exec -it slk-message pm2 start slk-message
