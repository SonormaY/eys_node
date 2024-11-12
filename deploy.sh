#! /usr/bin/bash

# 0. Pull the latest changes
git pull

# 1. Build the client
cd client
npm run build
sudo rm -rf /var/www/client
sudo cp -r dist /var/www/client

# 2. run server in tmux session
cd ../server
tmux kill-session -t server
tmux new-session -d -s server 'npm run deploy'