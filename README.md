# Tarifas App – Monitoreo de tarifas de energía en Colombia

Aplicación web desarrollada en **Angular 21** que permite **visualizar y monitorear las tarifas de energía eléctrica** de las comercializadoras en Colombia para el mercado regulado.

La solución forma parte de una arquitectura **fullstack** donde:

- Un **backend** ejecuta un **proceso ETL** que consume datos oficiales desde `datos.gov.co`, normaliza la información y la almacena en una base de datos.
- Este **frontend Angular** consume la API REST del backend para mostrar la información de manera **organizada, filtrable y entendible para cualquier usuario**.

> Nota: este repositorio corresponde al **frontend**. El backend (ETL, base de datos y envío de correos) se encuentra en un proyecto separado.

---

## Características principales

- Visualización de **tarifas eléctricas** para el mercado regulado en Colombia.
- **Filtros dinámicos** por:
  - Comercializadora
  - Año
  - Nivel de tensión
  - Período
- Vista en **tabla paginada** con detalle de las tarifas.
- Vista en **gráficos interactivos** (barras, línea, torta, radar) para análisis visual:
  - Top de comercializadoras por tarifa promedio.
  - Evolución temporal de tarifas por período.
  - Distribución por nivel de tensión.
  - Comparación de tarifa promedio, máxima y mínima.
- **Dashboard** con indicadores clave (KPIs).
- Módulo para **ejecutar el proceso ETL** desde la interfaz:
  - Lanza el proceso en el backend.
  - Muestra mensajes de éxito o error.
  - Actualiza la **fecha de última actualización**.
- Notificaciones amigables de éxito y error mediante toasts.
- Arquitectura moderna basada en:
  - **Standalone components**
  - **Signals** de Angular (`signal`, `computed`, `effect`, `resource`)
  - **ChangeDetectionStrategy.OnPush** para mejor rendimiento.

---

## Tecnologías utilizadas

- **Frontend**
  - [Angular 21](https://angular.dev/)
  - [PrimeNG](https://primeng.org/) + tema [Aura](https://www.primefaces.org/aura/)
  - [Chart.js](https://www.chartjs.org/) para gráficos
  - Tailwind/PrimeUI para estilos utilitarios (a través de `@tailwindcss/postcss`)


---

## Arquitectura del frontend

La aplicación está organizada en capas:

- `src/app/core/`
  - **Servicios compartidos**: manejo de mensajes (toasts), diálogos de confirmación, modales, rutas, storage, estados globales y helpers de formularios.
  - **Interceptors HTTP**:
    - `CredentialsInterceptor`: añade `withCredentials` a todas las peticiones.
    - `auth.interceptor`: base para manejar errores 401 (autenticación).
  - **Interfaces comunes**: paginación, respuestas genéricas, configuración de diálogos, etc.

- `src/app/pages/dashboard/`
  - **Componente principal** `Dashboard`:
    - Orquesta filtros, tabla, gráficos y ejecución del ETL.
    - Gestiona filtros y parámetros mediante `signals` y `computed`.
  - **Servicios de dominio**:
    - `TarifasService`: encapsula las llamadas al backend para:
      - Listado paginado de tarifas.
      - Opciones de filtros.
      - Dashboard/KPIs.
      - Última actualización.
      - Ejecución del ETL.
  - **Componentes de la página**:
    - `Filter`: filtros por comercializadora, año, nivel y período.
    - `TarifasTable`: tabla paginada con las tarifas.
    - `TarifasChart`: gráficos para análisis visual.
    - `ReloadEtl`: ejecución del proceso ETL y visualización de la última actualización.
  - **Interfaces de dominio**:
    - `Tarifas`, `TarifasOptions`, `DashboardFiltersDto`, `DashboardResponse`, `EtlRunResponse`, `LastUpdateResponse`, etc.

- `src/app/shared/`
  - Componentes reutilizables, como `KpiCard` para mostrar indicadores en el dashboard.

- `src/environments/`
  - `environment.ts`: configuración para producción.
  - `environment.development.ts`: configuración para desarrollo (por defecto, backend en `http://localhost:3000/api/v1/`).

---

## Requisitos previos

- [Node.js](https://nodejs.org/) (versión recomendada según `package.json`).
- [npm](https://www.npmjs.com/) (incluido con Node).
- Backend en ejecución apuntando a la URL configurada en `environment.development.ts`, por ejemplo:
  - `http://localhost:3000/api/v1/`

---

## Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/CristianMorenoPerez/tarifas-app.git
cd tarifas_app
npm install
```

---

## Ejecución en desarrollo

Para iniciar el servidor de desarrollo de Angular:

```bash
npm start
# o
ng serve --configuration development
```

Luego abre el navegador en:

```text
http://localhost:4200/
```

La aplicación recargará automáticamente al guardar cambios en los archivos fuente.

---

## Builds de producción

Para generar un build optimizado para producción:

```bash
npm run build
# o, directamente con Angular CLI
ng build --configuration production
```

Los artefactos generados se guardarán en el directorio `dist/`.

---

## Despliegue con Docker

Esta aplicación puede desplegarse fácilmente usando Docker y Nginx como servidor web para los archivos estáticos generados por Angular.

### Construir la imagen

Desde la raíz del proyecto, ejecuta:

```bash
docker build -t tarifas-app-frontend .
```

Esto:

- Usa el `Dockerfile` incluido en el proyecto.
- Compila la aplicación Angular en modo producción.
- Genera una imagen llamada `tarifas-app-frontend` basada en Nginx.

### Ejecutar el contenedor

Para levantar el contenedor y exponerlo en el puerto `8080` de tu máquina:

```bash
docker run -d --name tarifas-app-frontend -p 8080:80 tarifas-app-frontend
```

Luego puedes acceder a la aplicación en:

```text
http://localhost:8080
```

### Actualizar la imagen después de cambios

Si realizas cambios en el código y quieres desplegar una nueva versión:

```bash
docker stop tarifas-app-frontend
docker rm tarifas-app-frontend

docker build -t tarifas-app-frontend .
docker run -d --name tarifas-app-frontend -p 8080:80 tarifas-app-frontend
```

### Ejemplo de despliegue tipo producción

En un servidor remoto, el flujo típico sería:

1. Clonar el repositorio o descargar el código.
2. Construir la imagen:

   ```bash
   docker build -t tarifas-app-frontend .
   ```

3. Ejecutar el contenedor publicando el puerto 80:

   ```bash
   docker run -d --name tarifas-app-frontend -p 80:80 tarifas-app-frontend
   ```

La aplicación quedará accesible en `http://<IP_DEL_SERVIDOR>/`.

---

---

## Flujo funcional de la aplicación

1. **Carga inicial**
   - El frontend se conecta al backend para obtener:
     - Tarifas paginadas.
     - Opciones de filtros.
     - Datos agregados del dashboard.
     - Información de la última actualización.

2. **Exploración de tarifas**
   - El usuario ajusta filtros (comercializadora, año, nivel, período).
   - La app actualiza los `signals` de filtros y vuelve a consultar la API.
   - Tabla, gráficos y KPIs se actualizan con la nueva información.

3. **Análisis visual**
   - El usuario alterna entre vista de tabla y vista de gráficos.
   - Se muestran diferentes gráficos para comparar comercializadoras, períodos y niveles.

4. **Ejecución de ETL**
   - Desde el frontend se dispara el endpoint del backend que ejecuta el ETL.
   - Al finalizar, se muestran mensajes de éxito o error y se actualiza la última fecha de carga.
   - El backend se encarga de enviar un correo con el resumen de registros procesados.

---

## Dataset y fuente de datos

El backend se conecta al portal oficial de **Datos Abiertos de Colombia**:

- `https://www.datos.gov.co/`

Para consumir un conjunto de datos de **“Tarifas y Costos de Energía para el Mercado Regulado”**, el proceso ETL se encarga de:

- Extraer la información desde el API o archivo fuente.
- Transformar y normalizar las columnas relevantes.
- Cargar los registros en la base de datos utilizada por esta aplicación.

---

## Posibles mejoras futuras

- Integrar un asistente de IA que explique en lenguaje natural:
  - Por qué ciertas tarifas son más altas.
  - Tendencias entre períodos y comercializadoras.
- Añadir más pruebas automatizadas para componentes y servicios.
- Mejorar cacheo de datos y carga progresiva en gráficos con grandes volúmenes.
- Incorporar autenticación y autorizaciones por tipo de usuario (por ejemplo, solo administradores pueden lanzar ETL).

---

## Licencia

Este proyecto se ha desarrollado como parte de una **prueba técnica** para desarrollador/a junior fullstack. Puede adaptarse o extenderse según las necesidades de la organización.
