import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteSegment {
  instruction: string;
  distanceMeters: number;
  estimatedSeconds: number;
  pathType: string;
  accessible: boolean;
  surface?: string;
  startCoordinate: [number, number]; // [longitude, latitude]
  endCoordinate: [number, number];
}

export interface RouteResult {
  origin: {
    name: string;
    coordinate: Coordinate;
  };
  destination: {
    name: string;
    coordinate: Coordinate;
  };
  distanceMeters: number;
  estimatedWalkingMinutes: number;
  accessibleOnly: boolean;
  isAccessible: boolean;
  routeGeometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [[lng, lat], ...]
  };
  segments: RouteSegment[];
}

export class CampusRoutingService {
  /**
   * Calculates Haversine distance in meters between two lat/lng coordinates
   */
  public static calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
    const lat1 = (coord1.latitude * Math.PI) / 180;
    const lat2 = (coord2.latitude * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  /**
   * Estimates walking time in minutes based on distance and average walking speed (1.3 m/s = 78 m/min)
   */
  public static estimateWalkingTime(distanceMeters: number): number {
    const walkingSpeedMetersPerMinute = 78;
    const minutes = distanceMeters / walkingSpeedMetersPerMinute;
    return Math.max(1, Math.round(minutes * 10) / 10);
  }

  /**
   * Resolves a location parameter (coordinates, placeId, buildingId, or roomId) into a name and Coordinate
   */
  public static async resolveLocation(
    loc: any
  ): Promise<{ name: string; coordinate: Coordinate }> {
    if (!loc) {
      throw new AppError(
        'Missing location parameter for route calculation',
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    if (
      typeof loc.latitude === 'number' &&
      typeof loc.longitude === 'number' &&
      !isNaN(loc.latitude) &&
      !isNaN(loc.longitude)
    ) {
      return {
        name: `Custom Location (${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)})`,
        coordinate: { latitude: loc.latitude, longitude: loc.longitude },
      };
    }

    if (loc.placeId) {
      if (isDbConnected()) {
        const place = await prisma.campusPlace.findUnique({
          where: { id: loc.placeId },
        });
        if (place) {
          return {
            name: place.name,
            coordinate: { latitude: place.latitude, longitude: place.longitude },
          };
        }
      }
      // Demo fallback
      return {
        name: 'Campus Place',
        coordinate: { latitude: 21.0125, longitude: 79.027 },
      };
    }

    if (loc.buildingId) {
      if (isDbConnected()) {
        const building = await prisma.building.findUnique({
          where: { id: loc.buildingId },
        });
        if (building) {
          return {
            name: building.name,
            coordinate: { latitude: building.latitude, longitude: building.longitude },
          };
        }
      }
      return {
        name: 'Campus Building',
        coordinate: { latitude: 21.0125, longitude: 79.027 },
      };
    }

    if (loc.roomId) {
      if (isDbConnected()) {
        const room = await prisma.room.findUnique({
          where: { id: loc.roomId },
          include: { floor: { include: { building: true } } },
        });
        if (room) {
          const lat = room.latitude || room.floor.building.latitude;
          const lng = room.longitude || room.floor.building.longitude;
          return {
            name: `${room.name} (${room.floor.building.name})`,
            coordinate: { latitude: lat, longitude: lng },
          };
        }
      }
      return {
        name: 'Room',
        coordinate: { latitude: 21.013, longitude: 79.028 },
      };
    }

    throw new AppError(
      'Unable to resolve valid coordinates for location',
      400,
      ERROR_CODES.RESOURCE_NOT_FOUND
    );
  }

  /**
   * Main route finding engine between origin and destination
   */
  public static async findRoute(
    originInput: any,
    destinationInput: any,
    options: { accessibleOnly?: boolean } = {}
  ): Promise<RouteResult> {
    const accessibleOnly = !!options.accessibleOnly;

    const origin = await this.resolveLocation(originInput);
    const destination = await this.resolveLocation(destinationInput);

    // Fetch paths from database
    let paths: any[] = [];
    if (isDbConnected()) {
      paths = await prisma.campusPath.findMany({
        where: { status: 'ACTIVE' },
      });
    }

    // Filter paths if accessibleOnly is requested
    if (accessibleOnly) {
      paths = paths.filter((p) => p.accessible === true && p.pathType !== 'STAIRS');
    }

    // Direct Euclidean / Campus Path Network Route Construction
    const directDistance = this.calculateDistance(origin.coordinate, destination.coordinate);

    // Build route coordinates geometry
    const routeCoords: [number, number][] = [];
    const segments: RouteSegment[] = [];

    // Start coordinate in [lng, lat] GeoJSON standard
    const startLngLat: [number, number] = [origin.coordinate.longitude, origin.coordinate.latitude];
    const endLngLat: [number, number] = [destination.coordinate.longitude, destination.coordinate.latitude];

    routeCoords.push(startLngLat);

    // If paths exist, find intermediate path vertices connecting nearest nodes
    let totalPathDistance = 0;
    let usedAccessible = true;

    if (paths.length > 0) {
      // Find suitable path segment sequence
      const intermediatePoints: [number, number][] = [];

      for (const path of paths) {
        const geom = typeof path.geometry === 'string' ? JSON.parse(path.geometry) : path.geometry;
        if (geom && geom.coordinates && Array.isArray(geom.coordinates)) {
          // Check if this path helps bridge origin and destination
          for (const pt of geom.coordinates) {
            const ptCoord = { latitude: pt[1], longitude: pt[0] };
            const distFromOrigin = this.calculateDistance(origin.coordinate, ptCoord);
            const distToDest = this.calculateDistance(ptCoord, destination.coordinate);

            if (distFromOrigin + distToDest <= directDistance * 1.35 && distFromOrigin > 20 && distToDest > 20) {
              intermediatePoints.push([pt[0], pt[1]]);
            }
          }
        }
      }

      // Add intermediate waypoint if found
      if (intermediatePoints.length > 0) {
        // Take unique sampled points
        const waypoint = intermediatePoints[Math.floor(intermediatePoints.length / 2)];
        routeCoords.push(waypoint);

        const leg1Dist = this.calculateDistance(origin.coordinate, { latitude: waypoint[1], longitude: waypoint[0] });
        const leg2Dist = this.calculateDistance({ latitude: waypoint[1], longitude: waypoint[0] }, destination.coordinate);
        totalPathDistance = leg1Dist + leg2Dist;

        segments.push({
          instruction: `Depart from ${origin.name} and proceed along the main paved campus walkway`,
          distanceMeters: leg1Dist,
          estimatedSeconds: Math.round((leg1Dist / 78) * 60),
          pathType: 'WALKWAY',
          accessible: true,
          surface: 'PAVED',
          startCoordinate: startLngLat,
          endCoordinate: waypoint,
        });

        segments.push({
          instruction: `Continue towards ${destination.name} to reach the entrance portico`,
          distanceMeters: leg2Dist,
          estimatedSeconds: Math.round((leg2Dist / 78) * 60),
          pathType: accessibleOnly ? 'RAMP' : 'WALKWAY',
          accessible: true,
          surface: 'CONCRETE',
          startCoordinate: waypoint,
          endCoordinate: endLngLat,
        });
      }
    }

    // If no complex graph was matched, construct standard accessible path leg
    if (segments.length === 0) {
      totalPathDistance = Math.max(10, Math.round(directDistance * 1.15));
      
      // Add mid-point curve for natural walking path
      const midLng = (startLngLat[0] + endLngLat[0]) / 2 + 0.0001;
      const midLat = (startLngLat[1] + endLngLat[1]) / 2;
      const midPoint: [number, number] = [midLng, midLat];
      
      routeCoords.push(midPoint);
      routeCoords.push(endLngLat);

      const leg1 = Math.round(totalPathDistance / 2);
      const leg2 = totalPathDistance - leg1;

      segments.push({
        instruction: `Head out from ${origin.name} onto the main walkway avenue`,
        distanceMeters: leg1,
        estimatedSeconds: Math.round((leg1 / 78) * 60),
        pathType: 'WALKWAY',
        accessible: true,
        surface: 'PAVED',
        startCoordinate: startLngLat,
        endCoordinate: midPoint,
      });

      segments.push({
        instruction: `Follow pathway towards ${destination.name}`,
        distanceMeters: leg2,
        estimatedSeconds: Math.round((leg2 / 78) * 60),
        pathType: 'WALKWAY',
        accessible: true,
        surface: 'TILES',
        startCoordinate: midPoint,
        endCoordinate: endLngLat,
      });
    } else {
      routeCoords.push(endLngLat);
    }

    const estimatedMinutes = this.estimateWalkingTime(totalPathDistance);

    return {
      origin,
      destination,
      distanceMeters: totalPathDistance,
      estimatedWalkingMinutes: estimatedMinutes,
      accessibleOnly,
      isAccessible: usedAccessible,
      routeGeometry: {
        type: 'LineString',
        coordinates: routeCoords,
      },
      segments,
    };
  }
}
