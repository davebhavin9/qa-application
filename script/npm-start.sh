#!/bin/bash
cd /home/ubuntu/
npm install
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:cloudwatch-agent-config.json -s
sudo nohup node server &