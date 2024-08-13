#!/bin/bash

docker-compose build

docker images

docker-compose up 


sleep 3


docker-compose down

