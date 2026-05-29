#!/bin/bash
cd /home/ubuntu/aimarket
sudo docker compose -f docker-compose.prod.yml up -d --build frontend
