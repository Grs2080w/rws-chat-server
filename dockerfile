FROM node:slim

WORKDIR /app

# Copia todos os arquivos do projeto
COPY . .

# Instala dependências do projeto principal (que chama os scripts)
RUN npm install

# Expõe as portas (ajuste conforme necessário)
EXPOSE 4000

CMD ["npm", "start"]
