#!/bin/bash

# Espera o SQL Server iniciar completamente
echo "Esperando o SQL Server iniciar..."
sleep 20s

# Cria o banco de dados
echo "Criando o banco de dados QuaveChallenge..."
/opt/mssql-tools/bin/sqlcmd -S sqlserver -U sa -P QuaveRoot123! -Q "CREATE DATABASE QuaveChallenge" -C

echo "Banco de dados criado com sucesso!"