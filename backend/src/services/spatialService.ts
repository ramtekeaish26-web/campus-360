import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export class SpatialService {
  /**
   * Retrieves full campus map spatial dataset (Campus, Buildings with polygons, Places with categories, Paths)
   */
  public static async getCampusMap() {
    if (!isDbConnected()) {
      return {
        campus: {
          id: 'demo-campus-id',
          name: 'TGPCET Main Campus (Mohgaon)',
          code: 'TGPCET_MOHGAON_MAIN',
          latitude: 21.0118,
          longitude: 79.0275,
        },
        buildings: [],
        places: [],
        categories: [],
        paths: [],
      };
    }

    const campus = await prisma.campus.findFirst({
      where: { status: 'ACTIVE' },
    });

    const [buildings, places, categories, paths] = await Promise.all([
      prisma.building.findMany({
        where: { status: 'ACTIVE' },
        include: {
          facilities: { include: { facility: true } },
          entrances: { where: { status: 'ACTIVE' } },
          images: { where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.campusPlace.findMany({
        where: { status: 'ACTIVE' },
        include: {
          category: true,
          building: true,
          room: true,
          facilities: { include: { facility: true } },
          images: { where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.locationCategory.findMany({
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.campusPath.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      campus,
      buildings,
      places,
      categories,
      paths,
    };
  }

  /**
   * List buildings with optional type filter or search query
   */
  public static async getBuildings(query?: string, buildingType?: string) {
    if (!isDbConnected()) {
      return [];
    }

    const whereClause: any = { status: 'ACTIVE' };
    if (buildingType && buildingType !== 'ALL') {
      whereClause.buildingType = buildingType;
    }
    if (query && query.trim()) {
      whereClause.OR = [
        { name: { contains: query.trim(), mode: 'insensitive' } },
        { code: { contains: query.trim(), mode: 'insensitive' } },
        { description: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    return prisma.building.findMany({
      where: whereClause,
      include: {
        facilities: { include: { facility: true } },
        floors: {
          orderBy: { floorNumber: 'asc' },
          include: {
            _count: { select: { rooms: true } },
          },
        },
        entrances: { where: { status: 'ACTIVE' } },
        images: { where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get single building by ID
   */
  public static async getBuildingById(id: string) {
    if (!isDbConnected()) {
      throw new AppError('Building not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const building = await prisma.building.findUnique({
      where: { id },
      include: {
        facilities: { include: { facility: true } },
        floors: {
          orderBy: { floorNumber: 'asc' },
          include: {
            rooms: {
              where: { status: 'ACTIVE' },
              orderBy: { roomNumber: 'asc' },
            },
          },
        },
        entrances: { where: { status: 'ACTIVE' } },
        places: {
          where: { status: 'ACTIVE' },
          include: { category: true, facilities: { include: { facility: true } } },
        },
        images: { where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!building) {
      throw new AppError('Building not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    return building;
  }

  /**
   * List campus places with category / search filtering
   */
  public static async getPlaces(query?: string, categoryCode?: string, buildingId?: string) {
    if (!isDbConnected()) {
      return [];
    }

    const whereClause: any = { status: 'ACTIVE' };
    if (categoryCode && categoryCode !== 'ALL') {
      whereClause.category = { code: categoryCode };
    }
    if (buildingId) {
      whereClause.buildingId = buildingId;
    }
    if (query && query.trim()) {
      whereClause.OR = [
        { name: { contains: query.trim(), mode: 'insensitive' } },
        { slug: { contains: query.trim(), mode: 'insensitive' } },
        { description: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    return prisma.campusPlace.findMany({
      where: whereClause,
      include: {
        category: true,
        building: true,
        room: { include: { floor: true } },
        facilities: { include: { facility: true } },
        images: { where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get single campus place by ID
   */
  public static async getPlaceById(id: string) {
    if (!isDbConnected()) {
      throw new AppError('Campus place not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const place = await prisma.campusPlace.findUnique({
      where: { id },
      include: {
        category: true,
        building: {
          include: {
            entrances: true,
            facilities: { include: { facility: true } },
          },
        },
        room: { include: { floor: { include: { building: true } } } },
        facilities: { include: { facility: true } },
        images: { where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!place) {
      throw new AppError('Campus place not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    return place;
  }

  /**
   * Get campus place by QR-friendly slug (e.g. /campus/locations/:slug)
   */
  public static async getPlaceBySlug(slug: string) {
    if (!isDbConnected()) {
      throw new AppError('Location not found', 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const place = await prisma.campusPlace.findUnique({
      where: { slug },
      include: {
        category: true,
        building: {
          include: {
            entrances: { where: { status: 'ACTIVE' } },
            facilities: { include: { facility: true } },
          },
        },
        room: { include: { floor: { include: { building: true } } } },
        facilities: { include: { facility: true } },
        images: { where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!place) {
      throw new AppError(`Location with slug "${slug}" not found`, 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    return place;
  }

  /**
   * List rooms directory
   */
  public static async getRooms(buildingId?: string, floorNumber?: number, roomType?: string, query?: string) {
    if (!isDbConnected()) {
      return [];
    }

    const whereClause: any = { status: 'ACTIVE' };
    if (buildingId) {
      whereClause.floor = { buildingId };
    }
    if (typeof floorNumber === 'number') {
      whereClause.floor = { ...(whereClause.floor || {}), floorNumber };
    }
    if (roomType && roomType !== 'ALL') {
      whereClause.roomType = roomType;
    }
    if (query && query.trim()) {
      whereClause.OR = [
        { name: { contains: query.trim(), mode: 'insensitive' } },
        { roomNumber: { contains: query.trim(), mode: 'insensitive' } },
        { description: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    return prisma.room.findMany({
      where: whereClause,
      include: {
        floor: {
          include: {
            building: true,
          },
        },
        places: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [{ floor: { building: { name: 'asc' } } }, { floor: { floorNumber: 'asc' } }, { roomNumber: 'asc' }],
    });
  }

  /**
   * List all facilities with places count
   */
  public static async getFacilities() {
    if (!isDbConnected()) {
      return [];
    }

    return prisma.facility.findMany({
      include: {
        placeFacilities: {
          include: {
            place: {
              include: {
                category: true,
                building: true,
              },
            },
          },
        },
        buildingFacilities: {
          include: {
            building: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Global Campus Search across Buildings, Rooms, Facilities, Places, Departments
   */
  public static async searchCampus(q: string, category?: string, limit: number = 20) {
    if (!q || !q.trim() || !isDbConnected()) {
      return [];
    }

    const searchTerm = q.trim();

    const [places, buildings, rooms, facilities] = await Promise.all([
      prisma.campusPlace.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { slug: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          category: true,
          building: true,
          images: { take: 1 },
        },
        take: limit,
      }),
      prisma.building.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          images: { take: 1 },
        },
        take: limit,
      }),
      prisma.room.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { roomNumber: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          floor: { include: { building: true } },
        },
        take: limit,
      }),
      prisma.facility.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: limit,
      }),
    ]);

    // Format results into normalized search items
    const results: any[] = [];

    for (const pl of places) {
      results.push({
        id: pl.id,
        type: 'PLACE',
        name: pl.name,
        slug: pl.slug,
        category: pl.category.name,
        description: pl.description,
        buildingName: pl.building?.name,
        latitude: pl.latitude,
        longitude: pl.longitude,
        thumbnailUrl: pl.images[0]?.url,
        url: `/campus/locations/${pl.slug}`,
      });
    }

    for (const bld of buildings) {
      results.push({
        id: bld.id,
        type: 'BUILDING',
        name: bld.name,
        code: bld.code,
        category: bld.buildingType,
        description: bld.description,
        buildingName: bld.name,
        latitude: bld.latitude,
        longitude: bld.longitude,
        thumbnailUrl: bld.images[0]?.url,
        url: `/campus/buildings/${bld.id}`,
      });
    }

    for (const rm of rooms) {
      results.push({
        id: rm.id,
        type: 'ROOM',
        name: `${rm.name} (${rm.roomNumber})`,
        category: rm.roomType,
        description: rm.description,
        buildingName: rm.floor.building.name,
        floorName: rm.floor.name,
        latitude: rm.latitude || rm.floor.building.latitude,
        longitude: rm.longitude || rm.floor.building.longitude,
        url: `/campus/rooms?buildingId=${rm.floor.buildingId}`,
      });
    }

    for (const fac of facilities) {
      results.push({
        id: fac.id,
        type: 'FACILITY',
        name: fac.name,
        category: 'FACILITY',
        description: fac.description,
        url: `/campus/facilities`,
      });
    }

    return results.slice(0, limit);
  }

  // ==========================================
  // ADMIN SPATIAL MANAGEMENT METHODS
  // ==========================================

  public static async createBuilding(data: any) {
    const { facilityIds, ...buildingData } = data;
    const building = await prisma.building.create({
      data: buildingData,
    });

    if (facilityIds && Array.isArray(facilityIds)) {
      for (const fId of facilityIds) {
        await prisma.buildingFacility.create({
          data: { buildingId: building.id, facilityId: fId },
        });
      }
    }

    return this.getBuildingById(building.id);
  }

  public static async updateBuilding(id: string, data: any) {
    const { facilityIds, ...buildingData } = data;
    await prisma.building.update({
      where: { id },
      data: buildingData,
    });

    if (facilityIds && Array.isArray(facilityIds)) {
      await prisma.buildingFacility.deleteMany({ where: { buildingId: id } });
      for (const fId of facilityIds) {
        await prisma.buildingFacility.create({
          data: { buildingId: id, facilityId: fId },
        });
      }
    }

    return this.getBuildingById(id);
  }

  public static async deleteBuilding(id: string) {
    return prisma.building.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  public static async createFloor(data: any) {
    return prisma.floor.create({ data });
  }

  public static async updateFloor(id: string, data: any) {
    return prisma.floor.update({ where: { id }, data });
  }

  public static async deleteFloor(id: string) {
    return prisma.floor.update({ where: { id }, data: { status: 'INACTIVE' } });
  }

  public static async createRoom(data: any) {
    return prisma.room.create({ data });
  }

  public static async updateRoom(id: string, data: any) {
    return prisma.room.update({ where: { id }, data });
  }

  public static async deleteRoom(id: string) {
    return prisma.room.update({ where: { id }, data: { status: 'INACTIVE' } });
  }

  public static async createPlace(data: any) {
    const { facilityIds, ...placeData } = data;
    const place = await prisma.campusPlace.create({ data: placeData });

    if (facilityIds && Array.isArray(facilityIds)) {
      for (const fId of facilityIds) {
        await prisma.placeFacility.create({
          data: { placeId: place.id, facilityId: fId },
        });
      }
    }

    return this.getPlaceById(place.id);
  }

  public static async updatePlace(id: string, data: any) {
    const { facilityIds, ...placeData } = data;
    await prisma.campusPlace.update({
      where: { id },
      data: placeData,
    });

    if (facilityIds && Array.isArray(facilityIds)) {
      await prisma.placeFacility.deleteMany({ where: { placeId: id } });
      for (const fId of facilityIds) {
        await prisma.placeFacility.create({
          data: { placeId: id, facilityId: fId },
        });
      }
    }

    return this.getPlaceById(id);
  }

  public static async deletePlace(id: string) {
    return prisma.campusPlace.update({ where: { id }, data: { status: 'INACTIVE' } });
  }

  public static async createFacility(data: any) {
    return prisma.facility.create({ data });
  }

  public static async createEntrance(data: any) {
    return prisma.entrance.create({ data });
  }

  public static async deleteEntrance(id: string) {
    return prisma.entrance.update({ where: { id }, data: { status: 'INACTIVE' } });
  }

  public static async createPath(data: any) {
    return prisma.campusPath.create({ data });
  }

  public static async updatePath(id: string, data: any) {
    return prisma.campusPath.update({ where: { id }, data });
  }

  public static async deletePath(id: string) {
    return prisma.campusPath.update({ where: { id }, data: { status: 'INACTIVE' } });
  }

  public static async createImage(data: any) {
    return prisma.locationImage.create({ data });
  }

  public static async deleteImage(id: string) {
    return prisma.locationImage.delete({ where: { id } });
  }
}
