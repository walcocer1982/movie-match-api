import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import movieRoutes from './routes/movieRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './middlewares/logger.js';
import { corsMiddleware } from './middlewares/cors.js';

// Configurar variables de entorno
dotenv.config();

// Configurar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar rate limiting
const limiter = rateLimit({
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
});

// Cargar documentación Swagger
const swaggerDocument = YAML.load(join(__dirname, 'docs', 'swagger.yaml'));

// Middleware de seguridad
app.use(helmet());
app.use(limiter);

// Middleware de logging
app.use(logger);

// Middleware de CORS
app.use(corsMiddleware);

// Middleware para manejar JSON
app.use(express.json());

// Documentación Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ruta de estado
app.get('/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Montar las rutas
app.use('/api', movieRoutes);

// Manejador de rutas no encontradas
app.all('*', (req, res, next) => {
    const err = new Error(`Ruta ${req.originalUrl} no encontrada`);
    err.statusCode = 404;
    next(err);
});

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar el servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Documentación disponible en http://localhost:${PORT}/docs`);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    console.log('Recibida señal SIGTERM. Cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Recibida señal SIGINT. Cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado.');
        process.exit(0);
    });
}); 