#!/bin/bash

# Wait for PostgreSQL to start
#echo "Waiting for PostgreSQL to start..."
#sleep 5

# Execute the schema.sql script to set up the database
echo "Applying database schema..."
docker exec -i postgres psql -U myuser -d mydatabase -f /docker-entrypoint-initdb.d/schema.sql

# Ensure all commands are executed
echo "Database schema applied successfully."
