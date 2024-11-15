#!/usr/bin/bash

# Color codes for readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment...${NC}"

# Step 1: Pull latest code from repository
echo -e "${YELLOW}Pulling latest code...${NC}"
cd /home/sonorma/eys_node || exit
if git pull -q origin main; then
  echo -e "${GREEN}Code pulled successfully.${NC}"
else
  echo -e "${RED}Failed to pull code.${NC}"
  exit 1
fi

# Step 2: Build the client
echo -e "${YELLOW}Building the client...${NC}"
cd client || exit
if npm install --silent; then
  echo -e "${GREEN}Client dependencies installed successfully.${NC}"
else
  echo -e "${RED}Failed to install client dependencies.${NC}"
  exit 1
fi
if npm run build --silent; then
  echo -e "${GREEN}Client build completed successfully.${NC}"
else
  echo -e "${RED}Client build failed.${NC}"
  exit 1
fi

# Step 3: Deploy client files to server directory
echo -e "${YELLOW}Deploying client files...${NC}"
sudo rm -rf /var/www/client
if sudo cp -r dist /var/www/client; then
  echo -e "${GREEN}Client deployed successfully to /var/www/client.${NC}"
else
  echo -e "${RED}Failed to deploy client files.${NC}"
  exit 1
fi

# Step 4: Run service server in tmux session
echo -e "${YELLOW}Starting service server in tmux session...${NC}"
cd ../server || exit
if tmux ls | grep -q "^service-server:"; then
  tmux kill-session -t service-server
  echo -e "${GREEN}Existing tmux session 'service-server' terminated.${NC}"
fi
if tmux new-session -d -s service-server 'node service_index_rpi.js'; then
  echo -e "${GREEN}Service server started successfully in a new tmux session.${NC}"
else
  echo -e "${RED}Failed to start service server in tmux session.${NC}"
  exit 1
fi

# Step 5: Run files server in tmux session
echo -e "${YELLOW}Starting files server in tmux session...${NC}"
if tmux ls | grep -q "^files-server:"; then
  tmux kill-session -t files-server
  echo -e "${GREEN}Existing tmux session 'files-server' terminated.${NC}"
fi
if tmux new-session -d -s files-server 'node load_balancer_rpi.js'; then
  echo -e "${GREEN}Files server started successfully in a new tmux session.${NC}"
else
  echo -e "${RED}Failed to start files server in tmux session.${NC}"
  exit 1
fi

echo -e "${GREEN}Deployment completed successfully.${NC}"
