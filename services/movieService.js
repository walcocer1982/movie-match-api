import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { APIError } from '../middlewares/errorHandler.js';

class MovieService {
    constructor() {
        this.movies = [];
        this.loadMovies();
    }

    /**
     * Carga inicial de películas desde el archivo CSV
     */
    async loadMovies() {
        try {
            console.log('Intentando cargar el archivo de películas...');
            const data = await fs.readFile('./data/movies.csv', 'utf-8');
            console.log('Archivo leído correctamente, parseando datos...');
            
            // Dividir en líneas y filtrar líneas vacías
            const lines = data.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            // Obtener encabezados
            const headers = lines[0].split(',');
            console.log('Encabezados encontrados:', headers);
            
            // Parsear manualmente con máxima tolerancia
            this.movies = [];
            
            // Empezamos desde la línea 1 (después de los encabezados)
            for (let i = 1; i < lines.length; i++) {
                try {
                    // Intentar parsear cada línea
                    const parsedLine = this.parseCSVLine(lines[i]);
                    
                    // Si tenemos el número esperado de columnas
                    if (parsedLine.length === headers.length) {
                        const movie = {};
                        headers.forEach((header, index) => {
                            let value = parsedLine[index];
                            
                            // Limpiar las comillas si existen
                            if (value.startsWith('"') && value.endsWith('"')) {
                                value = value.substring(1, value.length - 1);
                            }
                            
                            // Convertir tipos según el encabezado
                            if (header === 'year' || header === 'runtime_minutes') {
                                movie[header] = parseInt(value) || 0;
                            } else if (header === 'imdb_rating') {
                                movie[header] = parseFloat(value) || 0;
                            } else {
                                movie[header] = value;
                            }
                        });
                        
                        this.movies.push(movie);
                    } else {
                        console.warn(`Advertencia: Omitiendo línea ${i + 1} porque tiene ${parsedLine.length} columnas en lugar de ${headers.length}`);
                    }
                } catch (lineError) {
                    console.warn(`Error al parsear línea ${i + 1}:`, lineError.message);
                }
            }
            
            console.log(`✅ Cargadas ${this.movies.length} películas exitosamente`);
        } catch (error) {
            console.error('❌ Error al cargar las películas:', error.message);
            this.movies = [];
            throw new APIError('Error al cargar las películas: ' + error.message, 500);
        }
    }
    
    /**
     * Parsea una línea CSV respetando las comillas
     * @param {string} line - Línea CSV a parsear
     * @returns {string[]} - Array con los valores parseados
     */
    parseCSVLine(line) {
        const values = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        // No olvidar añadir el último valor
        values.push(currentValue);
        
        return values;
    }

    /**
     * Obtiene todas las películas con filtros opcionales
     * @param {Object} filters - Objeto con los filtros a aplicar
     * @param {string} [filters.genre] - Género para filtrar
     * @param {string} [filters.title] - Título parcial para buscar
     * @param {number} [filters.year] - Año específico
     * @param {number} [filters.fromYear] - Año inicial del rango
     * @param {number} [filters.toYear] - Año final del rango
     * @returns {Promise<Array>} - Array con las películas que coincidan
     */
    async getAllMovies(filters = {}) {
        if (this.movies.length === 0) {
            throw new APIError('No hay películas cargadas en el sistema', 500);
        }

        let filteredMovies = [...this.movies];

        // Validar y aplicar filtros de rango de años
        if (filters.fromYear || filters.toYear) {
            const currentYear = new Date().getFullYear();
            const fromYear = filters.fromYear ? parseInt(filters.fromYear) : 1800;
            const toYear = filters.toYear ? parseInt(filters.toYear) : currentYear;

            // Validar que los años sean números válidos
            if (isNaN(fromYear) || isNaN(toYear)) {
                throw new APIError('Los años especificados no son válidos', 400);
            }

            // Validar rango de años
            if (fromYear > toYear) {
                throw new APIError('El año inicial no puede ser mayor que el año final', 400);
            }

            // Validar años futuros
            if (toYear > currentYear) {
                throw new APIError(`El año final no puede ser mayor que el año actual (${currentYear})`, 400);
            }

            console.log(`Aplicando filtro por rango de años: ${fromYear} - ${toYear}`);
            filteredMovies = filteredMovies.filter(movie => 
                movie.year >= fromYear && movie.year <= toYear
            );
        }

        if (filters.title) {
            console.log('Aplicando filtro por título:', filters.title);
            filteredMovies = filteredMovies.filter(movie => 
                movie.title.toLowerCase().includes(filters.title.toLowerCase())
            );
        }

        if (filters.genre) {
            console.log('Aplicando filtro por género:', filters.genre);
            filteredMovies = filteredMovies.filter(movie => 
                movie.genre.toLowerCase().includes(filters.genre.toLowerCase())
            );
        }

        if (filters.year) {
            console.log('Aplicando filtro por año específico:', filters.year);
            const yearNum = parseInt(filters.year);
            filteredMovies = filteredMovies.filter(movie => movie.year === yearNum);
        }

        // Ordenar por año si se aplicó filtro de rango
        if (filters.fromYear || filters.toYear) {
            filteredMovies.sort((a, b) => a.year - b.year);
        }

        if (filteredMovies.length === 0) {
            throw new APIError('No se encontraron películas con los criterios especificados', 404);
        }

        return filteredMovies;
    }

    /**
     * Busca una película por ID o título
     * @param {string} idOrTitle - ID o título de la película
     * @returns {Promise<Object>} - Película encontrada y recomendaciones
     */
    async getMovieByIdOrTitle(idOrTitle) {
        if (this.movies.length === 0) {
            throw new APIError('No hay películas cargadas en el sistema', 500);
        }

        console.log(`Buscando película con ID o título: "${idOrTitle}"`);
        console.log(`Total de películas disponibles: ${this.movies.length}`);
        
        // Búsqueda más flexible
        const movie = this.movies.find(m => {
            // Verificar si coincide con el ID
            if (m.id === idOrTitle) {
                console.log(`Película encontrada por ID: ${m.id}`);
                return true;
            }
            
            // Verificar si coincide exactamente con el título
            if (m.title.toLowerCase() === idOrTitle.toLowerCase()) {
                console.log(`Película encontrada por título exacto: ${m.title}`);
                return true;
            }
            
            // Verificar si el título contiene la búsqueda
            if (m.title.toLowerCase().includes(idOrTitle.toLowerCase())) {
                console.log(`Película encontrada por título parcial: ${m.title}`);
                return true;
            }
            
            return false;
        });

        if (!movie) {
            console.log('No se encontró ninguna película con ese ID o título');
            // Mostrar algunos ejemplos de IDs y títulos disponibles
            console.log('Ejemplos de IDs disponibles:', this.movies.slice(0, 3).map(m => m.id));
            console.log('Ejemplos de títulos disponibles:', this.movies.slice(0, 3).map(m => m.title));
            throw new APIError('Película no encontrada', 404);
        }

        console.log(`Película encontrada: ${movie.title} (${movie.id})`);
        const recommendations = await this.getRecommendations(movie);
        console.log(`Generadas ${recommendations.length} recomendaciones`);

        return {
            movie,
            recommendations
        };
    }

    /**
     * Obtiene recomendaciones basadas en una película
     * @param {Object} movie - Película base para recomendaciones
     * @returns {Promise<Array>} - Array de películas recomendadas
     */
    async getRecommendations(movie) {
        const movieGenres = movie.genre.split(',').map(g => g.trim().toLowerCase());
        
        return this.movies
            .filter(m => m.id !== movie.id)
            .filter(m => {
                const genres = m.genre.split(',').map(g => g.trim().toLowerCase());
                return genres.some(g => movieGenres.includes(g));
            })
            .sort((a, b) => b.imdb_rating - a.imdb_rating)
            .slice(0, 5);
    }

    /**
     * Obtiene estadísticas de películas
     * @returns {Promise<Object>} - Estadísticas de películas
     */
    async getMovieStats() {
        if (this.movies.length === 0) {
            throw new APIError('No hay películas cargadas en el sistema', 500);
        }

        const stats = {
            total: this.movies.length,
            byGenre: {},
            avgRating: 0,
            avgDuration: 0
        };

        let totalRating = 0;
        let totalDuration = 0;

        this.movies.forEach(movie => {
            // Procesar géneros
            const genres = movie.genre.split(',').map(g => g.trim());
            genres.forEach(genre => {
                stats.byGenre[genre] = (stats.byGenre[genre] || 0) + 1;
            });

            // Acumular rating y duración
            totalRating += movie.imdb_rating;
            totalDuration += movie.runtime_minutes;
        });

        stats.avgRating = (totalRating / this.movies.length).toFixed(2);
        stats.avgDuration = Math.round(totalDuration / this.movies.length);

        return stats;
    }
}

// Exportar la instancia de MovieService
export const movieService = new MovieService(); 