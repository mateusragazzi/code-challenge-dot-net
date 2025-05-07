#!/bin/bash

cd /app/backend/QuaveChallenge.API

wait_for_db() {
    echo "Waiting for database to be ready..."
    
    # Use a more direct approach to check if the database is ready
    until dotnet ef database update --no-build; do
        echo "Database not ready yet, retrying in 5 seconds..."
        sleep 5
    done
    
    echo "Database is ready!"
}

wait_for_db

echo "Starting application..."
dotnet watch run --urls=http://0.0.0.0:5203