#!/bin/bash
cd /home/ubuntu/
npm install
sudo nohup node server >> output.log 2>&1 &