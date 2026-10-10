import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { searchQuerySchema } from '../validators/spatialValidators.js';
import {
  getCampusMap,
  getBuildings,
  getBuildingById,
  getPlaces,
  getPlaceById,
  getPlaceBySlug,
  getRooms,
  getFacilities,
  searchCampus,
} from '../controllers/spatialController.js';

const router = Router();

// All discovery endpoints require valid authenticated session
router.use(requireAuth);

router.get('/map', getCampusMap);
router.get('/buildings', getBuildings);
router.get('/buildings/:id', getBuildingById);
router.get('/places', getPlaces);
router.get('/places/:id', getPlaceById);
router.get('/locations/:slug', getPlaceBySlug);
router.get('/rooms', getRooms);
router.get('/facilities', getFacilities);
router.get('/search', validateQuery(searchQuerySchema), searchCampus);

export default router;
