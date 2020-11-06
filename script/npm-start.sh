#!/bin/bash
cd /home/ubuntu/
npm install
sudo nohup node app.js >> output.log 2>&1 &