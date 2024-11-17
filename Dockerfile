# Usar una imagen base de Node.js
FROM node:16

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar los archivos de la aplicación
COPY package*.json ./
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto que el contenedor va a usar
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["node", "main.js"]
