import { movieService } from '../services/movieService.js';
import { APIError } from '../middlewares/errorHandler.js';

class MovieController {
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
            const result = await movieService.getMovieByIdOrTitle(req.params.id_or_title);
            
            res.json({
                status: 'success',
                message: 'Película encontrada con recomendaciones',
                data: result
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
            let filteredMovies = [...movieService.movies];

            if (min_rating) {
                filteredMovies = filteredMovies.filter(movie => movie.imdb_rating >= parseFloat(min_rating));
            }
            if (max_rating) {
                filteredMovies = filteredMovies.filter(movie => movie.imdb_rating <= parseFloat(max_rating));
            }

            filteredMovies.sort((a, b) => b.imdb_rating - a.imdb_rating);

            if (limit) {
                filteredMovies = filteredMovies.slice(0, parseInt(limit));
            }

            // Construir mensaje descriptivo basado en los filtros aplicados
            const filterDescriptions = [];
            if (min_rating) filterDescriptions.push(`calificación mínima: ${min_rating}`);
            if (max_rating) filterDescriptions.push(`calificación máxima: ${max_rating}`);

            const message = filterDescriptions.length > 0
                ? `Películas filtradas por ${filterDescriptions.join(' y ')}`
                : 'Películas ordenadas por calificación';

            res.json({
                status: 'success',
                message,
                data: {
                    total: filteredMovies.length,
                    movies: filteredMovies
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export const movieController = new MovieController(); 