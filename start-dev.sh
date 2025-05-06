
#!/bin/sh
# Script para iniciar o ambiente de desenvolvimento

docker-compose -f docker-compose-dev.yml down

docker-compose -f docker-compose-dev.yml build

docker-compose -f docker-compose-dev.yml up -d