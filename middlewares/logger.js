/**
 * Middleware para registrar las solicitudes HTTP
 * Incluye timestamp, método HTTP y ruta
 */
export const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip;

    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

    // Registrar el tiempo de respuesta
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        console.log(`[${timestamp}] ${method} ${url} - Status: ${status} - Duración: ${duration}ms`);
    });

    next();
}; 