import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  buildingCreateSchema,
  buildingUpdateSchema,
  floorCreateSchema,
  floorUpdateSchema,
  roomCreateSchema,
  roomUpdateSchema,
  placeCreateSchema,
  placeUpdateSchema,
  facilityCreateSchema,
  entranceCreateSchema,
  pathCreateSchema,
  pathUpdateSchema,
  imageCreateSchema,
} from '../validators/spatialValidators.js';
import {
  adminCreateBuilding,
  adminUpdateBuilding,
  adminDeleteBuilding,
  adminCreateFloor,
  adminUpdateFloor,
  adminDeleteFloor,
  adminCreateRoom,
  adminUpdateRoom,
  adminDeleteRoom,
  adminCreatePlace,
  adminUpdatePlace,
  adminDeletePlace,
  adminCreateFacility,
  adminCreateEntrance,
  adminDeleteEntrance,
  adminCreatePath,
  adminUpdatePath,
  adminDeletePath,
  adminCreateImage,
  adminDeleteImage,
} from '../controllers/spatialController.js';

const router = Router();

// Strict RBAC: All Admin Spatial Operations Require ADMIN Role
router.use(requireAuth);
router.use(requireRole('ADMIN'));

// Buildings
router.post('/buildings', validateBody(buildingCreateSchema), adminCreateBuilding);
router.patch('/buildings/:id', validateBody(buildingUpdateSchema), adminUpdateBuilding);
router.delete('/buildings/:id', adminDeleteBuilding);

// Floors
router.post('/floors', validateBody(floorCreateSchema), adminCreateFloor);
router.patch('/floors/:id', validateBody(floorUpdateSchema), adminUpdateFloor);
router.delete('/floors/:id', adminDeleteFloor);

// Rooms
router.post('/rooms', validateBody(roomCreateSchema), adminCreateRoom);
router.patch('/rooms/:id', validateBody(roomUpdateSchema), adminUpdateRoom);
router.delete('/rooms/:id', adminDeleteRoom);

// Campus Places
router.post('/places', validateBody(placeCreateSchema), adminCreatePlace);
router.patch('/places/:id', validateBody(placeUpdateSchema), adminUpdatePlace);
router.delete('/places/:id', adminDeletePlace);

// Facilities
router.post('/facilities', validateBody(facilityCreateSchema), adminCreateFacility);

// Entrances
router.post('/entrances', validateBody(entranceCreateSchema), adminCreateEntrance);
router.delete('/entrances/:id', adminDeleteEntrance);

// Paths
router.post('/paths', validateBody(pathCreateSchema), adminCreatePath);
router.patch('/paths/:id', validateBody(pathUpdateSchema), adminUpdatePath);
router.delete('/paths/:id', adminDeletePath);

// Images
router.post('/images', validateBody(imageCreateSchema), adminCreateImage);
router.delete('/images/:id', adminDeleteImage);

export default router;
