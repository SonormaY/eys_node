#! /usr/bin/bash

# 2. Build the client
cd client
npm run build
sudo rm -rf /var/www/client
sudo cp -r dist /var/www/client

# 3. run server in tmux session
cd ../server
if tmux info &>/dev/null; then
    # Check if a tmux session named 'server' exists
    if tmux ls | grep -q "^server:"; then
        tmux kill-session -t server
    fi
fi
tmux new-session -d -s server 'npm run deploy'