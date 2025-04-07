/**
 * Middleware personalizado para CORS
 * Configura los headers necesarios para permitir solicitudes cross-origin
 */
export const corsMiddleware = (req, res, next) => {
    // Configurar los orígenes permitidos (usar variable de entorno en producción)
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    
    // Métodos HTTP permitidos
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // Headers permitidos
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Habilitar credenciales
    res.header('Access-Control-Allow-Credentials', true);

    // Manejar solicitudes OPTIONS
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
}; 