import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { SpatialService } from '../services/spatialService.js';
import { sendSuccess } from '../utils/response.js';

export async function getCampusMap(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.getCampusMap();
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function getBuildings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = req.query.q as string | undefined;
    const buildingType = req.query.type as string | undefined;
    const data = await SpatialService.getBuildings(query, buildingType);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function getBuildingById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.getBuildingById(req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function getPlaces(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = req.query.q as string | undefined;
    const category = req.query.category as string | undefined;
    const buildingId = req.query.buildingId as string | undefined;
    const data = await SpatialService.getPlaces(query, category, buildingId);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function getPlaceById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.getPlaceById(req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function getPlaceBySlug(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.getPlaceBySlug(req.params.slug);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function getRooms(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const buildingId = req.query.buildingId as string | undefined;
    const floorNumber = req.query.floorNumber ? parseInt(req.query.floorNumber as string, 10) : undefined;
    const roomType = req.query.roomType as string | undefined;
    const query = req.query.q as string | undefined;
    const data = await SpatialService.getRooms(buildingId, floorNumber, roomType, query);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function getFacilities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.getFacilities();
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function searchCampus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string) || '';
    const category = req.query.category as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const data = await SpatialService.searchCampus(q, category, limit);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

// Admin Spatial Controller Handlers
export async function adminCreateBuilding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.createBuilding(req.body);
    return sendSuccess(res, data, 201);
  } catch (error) {
    return next(error);
  }
}

export async function adminUpdateBuilding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.updateBuilding(req.params.id, req.body);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function adminDeleteBuilding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.deleteBuilding(req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function adminCreateFloor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.createFloor(req.body);
    return sendSuccess(res, data, 201);
  } catch (error) {
    return next(error);
  }
}

export async function adminUpdateFloor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.updateFloor(req.params.id, req.body);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function adminDeleteFloor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.deleteFloor(req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function adminCreateRoom(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.createRoom(req.body);
    return sendSuccess(res, data, 201);
  } catch (error) {
    return next(error);
  }
}

export async function adminUpdateRoom(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.updateRoom(req.params.id, req.body);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function adminDeleteRoom(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.deleteRoom(req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function adminCreatePlace(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.createPlace(req.body);
    return sendSuccess(res, data, 201);
  } catch (error) {
    return next(error);
  }
}

export async function adminUpdatePlace(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.updatePlace(req.params.id, req.body);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function adminDeletePlace(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.deletePlace(req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function adminCreateFacility(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.createFacility(req.body);
    return sendSuccess(res, data, 201);
  } catch (error) {
    return next(error);
  }
}

export async function adminCreateEntrance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.createEntrance(req.body);
    return sendSuccess(res, data, 201);
  } catch (error) {
    return next(error);
  }
}

export async function adminDeleteEntrance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.deleteEntrance(req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function adminCreatePath(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.createPath(req.body);
    return sendSuccess(res, data, 201);
  } catch (error) {
    return next(error);
  }
}

export async function adminUpdatePath(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.updatePath(req.params.id, req.body);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function adminDeletePath(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.deletePath(req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function adminCreateImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.createImage(req.body);
    return sendSuccess(res, data, 201);
  } catch (error) {
    return next(error);
  }
}

export async function adminDeleteImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await SpatialService.deleteImage(req.params.id);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}
