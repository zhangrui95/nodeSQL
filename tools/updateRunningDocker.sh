sudo docker cp server.js slk-message:/opt/hylink/slk-message/server.js
sudo docker cp pg-api.js slk-message:/opt/hylink/slk-message/pg-api.js
sudo docker exec -it slk-message pm2 reload slk-message
