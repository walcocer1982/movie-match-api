# Movie Match API

API RESTful para búsqueda y recomendación de películas, desarrollada con Node.js y Express.

## Características

- Búsqueda de películas por múltiples criterios (nombre, género, año)
- Sistema de recomendaciones basado en géneros
- Manejo de errores centralizado
- Logging de solicitudes
- Documentación con Swagger/OpenAPI
- Soporte para CORS

## Requisitos

- Node.js >= 14.x
- npm >= 6.x

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd movie-match-api
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar el archivo `.env` con tus configuraciones

## Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

## Estructura del Proyecto

```
movie-match-api/
├── controllers/         # Controladores de la aplicación
├── data/               # Datos de películas (CSV)
├── routes/             # Definición de rutas
├── middlewares/        # Middlewares personalizados
├── services/           # Lógica de negocio
├── docs/              # Documentación (Swagger)
└── [otros archivos]   # Configuración y punto de entrada
```

## API Endpoints

La documentación completa de la API está disponible en:
- Desarrollo: http://localhost:3000/api-docs

### Principales Endpoints

- `GET /movies`: Lista todas las películas
- `GET /movies/search`: Busca películas por criterios
  - Parámetros: name, genre, year

## Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles. 