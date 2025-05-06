#!/bin/bash

# Esperar o banco de dados estar pronto
echo "Waiting for database..."
sleep 40

# Navegar para o diretório do projeto
cd /app/backend/QuaveChallenge.API

dotnet build

# Forçar a criação do banco e aplicar as migrations
echo "Creating database and applying migrations..."
dotnet ef database update

# Iniciar a aplicação
echo "Starting application..."
dotnet run 