import { Router } from 'express';
import { movieController } from '../controllers/movieController.js';

const router = Router();

// Rutas de películas
router.get('/movies', movieController.getAllMovies);
router.get('/movies/stats', movieController.getMovieStats);
router.get('/movies/rating', movieController.getMoviesByRating);
router.get('/movies/:id_or_title', movieController.getMovieByIdOrTitle);

export default router; 