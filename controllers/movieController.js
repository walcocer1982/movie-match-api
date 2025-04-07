import { movieService } from '../services/movieService.js';
import { APIError } from '../middlewares/errorHandler.js';

class MovieController {
    /**
     * Obtiene el mensaje de bienvenida y documentación
     */
    async getWelcome(req, res) {
        const welcomeMessage = {
            message: "Bienvenido a la API de Movie Match",
            version: "1.0.0",
            endpoints: [
                {
                    path: "/",
                    method: "GET",
                    description: "Mensaje de bienvenida y documentación"
                },
                {
                    path: "/movies",
                    method: "GET",
                    description: "Lista todas las películas",
                    query_params: [
                        { name: "title", description: "Filtrar por título" },
                        { name: "genre", description: "Filtrar por género" },
                        { name: "year", description: "Filtrar por año específico" },
                        { name: "fromYear", description: "Año inicial del rango" },
                        { name: "toYear", description: "Año final del rango" }
                    ]
                },
                {
                    path: "/movies/rating",
                    method: "GET",
                    description: "Filtrar películas por calificación",
                    query_params: [
                        { name: "min_rating", description: "Calificación mínima (0-10)" },
                        { name: "max_rating", description: "Calificación máxima (0-10)" },
                        { name: "limit", description: "Límite de resultados" }
                    ]
                },
                {
                    path: "/movies/:id_or_title",
                    method: "GET",
                    description: "Busca una película por ID o título"
                }
            ],
            documentation: "/docs"
        };
        
        res.json(welcomeMessage);
    }

    async getAllMovies(req, res, next) {
        try {
            const { genre, title, year, fromYear, toYear } = req.query;
            const filters = { genre, title, year, fromYear, toYear };
            const movies = await movieService.getAllMovies(filters);

            // Construir mensaje descriptivo basado en los filtros aplicados
            const filterDescriptions = [];
            if (title) filterDescriptions.push(`título: "${title}"`);
            if (year) filterDescriptions.push(`año: ${year}`);
            if (fromYear && toYear) {
                filterDescriptions.push(`años entre ${fromYear} y ${toYear}`);
            } else if (fromYear) {
                filterDescriptions.push(`años desde ${fromYear}`);
            } else if (toYear) {
                filterDescriptions.push(`años hasta ${toYear}`);
            }
            if (genre) filterDescriptions.push(`género: ${genre}`);

            const message = filterDescriptions.length > 0
                ? `Películas encontradas con ${filterDescriptions.join(' y ')}`
                : 'Todas las películas';

            res.json({
                status: 'success',
                message,
                data: {
                    total: movies.length,
                    movies
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getMovieByIdOrTitle(req, res, next) {
        try {
            const movie = await movieService.getMovieByIdOrTitle(req.params.id_or_title);
            
            res.json({
                status: 'success',
                message: 'Película encontrada',
                data: movie
            });
        } catch (error) {
            next(error);
        }
    }

    async getMovieStats(req, res, next) {
        try {
            const stats = await movieService.getMovieStats();
            res.json({
                status: 'success',
                message: 'Estadísticas de películas',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    async getMoviesByRating(req, res, next) {
        try {
            const { min_rating, max_rating, limit } = req.query;
            const movies = await movieService.getMoviesByRating({ min_rating, max_rating, limit });

            // Construir mensaje descriptivo
            const filterDescriptions = [];
            if (min_rating) filterDescriptions.push(`calificación mínima: ${min_rating}`);
            if (max_rating) filterDescriptions.push(`calificación máxima: ${max_rating}`);
            if (limit) filterDescriptions.push(`límite: ${limit}`);

            const message = filterDescriptions.length > 0
                ? `Películas filtradas por ${filterDescriptions.join(' y ')}`
                : 'Películas ordenadas por calificación';

            res.json({
                status: 'success',
                message,
                data: {
                    total: movies.length,
                    movies
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export const movieController = new MovieController(); 