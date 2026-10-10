import { apiClient } from './apiClient.js';
import {
  CampusMapBundle,
  Building,
  CampusPlace,
  Room,
  Facility,
  SpatialSearchResult,
  RouteResult,
} from '../types/spatial.js';

export const spatialApi = {
  // Discovery & Map
  async getCampusMap(): Promise<CampusMapBundle> {
    return apiClient.get<CampusMapBundle>('/campus/map');
  },

  async getBuildings(query?: string, type?: string): Promise<Building[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (type && type !== 'ALL') params.append('type', type);
    return apiClient.get<Building[]>(`/campus/buildings?${params.toString()}`);
  },

  async getBuildingById(id: string): Promise<Building> {
    return apiClient.get<Building>(`/campus/buildings/${id}`);
  },

  async getPlaces(query?: string, category?: string, buildingId?: string): Promise<CampusPlace[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category && category !== 'ALL') params.append('category', category);
    if (buildingId) params.append('buildingId', buildingId);
    return apiClient.get<CampusPlace[]>(`/campus/places?${params.toString()}`);
  },

  async getPlaceById(id: string): Promise<CampusPlace> {
    return apiClient.get<CampusPlace>(`/campus/places/${id}`);
  },

  async getPlaceBySlug(slug: string): Promise<CampusPlace> {
    return apiClient.get<CampusPlace>(`/campus/locations/${slug}`);
  },

  async getRooms(buildingId?: string, floorNumber?: number, roomType?: string, query?: string): Promise<Room[]> {
    const params = new URLSearchParams();
    if (buildingId) params.append('buildingId', buildingId);
    if (typeof floorNumber === 'number') params.append('floorNumber', floorNumber.toString());
    if (roomType && roomType !== 'ALL') params.append('roomType', roomType);
    if (query) params.append('q', query);
    return apiClient.get<Room[]>(`/campus/rooms?${params.toString()}`);
  },

  async getFacilities(): Promise<Facility[]> {
    return apiClient.get<Facility[]>('/campus/facilities');
  },

  async searchCampus(q: string, category?: string): Promise<SpatialSearchResult[]> {
    if (!q || !q.trim()) return [];
    const params = new URLSearchParams({ q: q.trim() });
    if (category) params.append('category', category);
    return apiClient.get<SpatialSearchResult[]>(`/campus/search?${params.toString()}`);
  },

  // Navigation & Route Engine
  async calculateRoute(origin: any, destination: any, accessibleOnly: boolean = false): Promise<RouteResult> {
    return apiClient.post<RouteResult>('/navigation/route', {
      origin,
      destination,
      accessibleOnly,
    });
  },

  // Admin CRUD
  async createBuilding(data: any): Promise<Building> {
    return apiClient.post<Building>('/admin/campus/buildings', data);
  },

  async updateBuilding(id: string, data: any): Promise<Building> {
    return apiClient.patch<Building>(`/admin/campus/buildings/${id}`, data);
  },

  async deleteBuilding(id: string): Promise<void> {
    await apiClient.delete(`/admin/campus/buildings/${id}`);
  },

  async createFloor(data: any): Promise<any> {
    return apiClient.post<any>('/admin/campus/floors', data);
  },

  async createRoom(data: any): Promise<Room> {
    return apiClient.post<Room>('/admin/campus/rooms', data);
  },

  async createPlace(data: any): Promise<CampusPlace> {
    return apiClient.post<CampusPlace>('/admin/campus/places', data);
  },

  async updatePlace(id: string, data: any): Promise<CampusPlace> {
    return apiClient.patch<CampusPlace>(`/admin/campus/places/${id}`, data);
  },

  async deletePlace(id: string): Promise<void> {
    await apiClient.delete(`/admin/campus/places/${id}`);
  },

  async createPath(data: any): Promise<any> {
    return apiClient.post<any>('/admin/campus/paths', data);
  },
};
