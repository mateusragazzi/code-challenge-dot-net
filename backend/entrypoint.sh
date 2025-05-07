#!/bin/bash

wait_for_mssqltools() {
    echo "Waiting for database..."
    
    while [ "$(docker ps -q -f name=mssqltools)" ]; do
        echo "mssqltools is loading..."
        sleep 5
    done
    
    echo "mssqltools has finished!"
}

wait_for_mssqltools

cd /app/backend/QuaveChallenge.API

echo "Creating database and applying migrations..."
dotnet ef database update

echo "Starting application..."
dotnet watch run --urls=http://0.0.0.0:5203