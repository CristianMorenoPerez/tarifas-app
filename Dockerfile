# Etapa 1: Build de la aplicación Angular
FROM node:20-alpine AS build

WORKDIR /app

# Copiar solo los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instalar dependencias en modo reproducible
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación en modo producción
RUN npm run build

# Etapa 2: Servir la app estática con Nginx
FROM nginx:stable-alpine

# Copiar el build de Angular al directorio público de Nginx
# Ajusta la ruta si el nombre del proyecto cambia en angular.json
COPY --from=build /app/dist/tarifa-app/browser /usr/share/nginx/html

# Exponer el puerto HTTP por defecto
EXPOSE 80

# Comando por defecto (Nginx en primer plano)
CMD ["nginx", "-g", "daemon off;"]