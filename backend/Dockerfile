FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /app/backend

# Install dos2unix utility
RUN apt-get update && apt-get install -y dos2unix

# Copiar os arquivos do projeto
COPY . .

# Instalar o dotnet-ef globalmente para poder rodar as migrations
RUN dotnet tool install --global dotnet-ef

# Adicionar o dotnet-ef ao PATH
ENV PATH="${PATH}:/root/.dotnet/tools"

# Ensure proper line endings and executable permissions
RUN dos2unix entrypoint.sh && chmod +x entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"] 