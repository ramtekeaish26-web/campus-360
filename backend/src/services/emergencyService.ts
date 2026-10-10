import { prisma, isDbConnected } from '../config/db.js';

export class EmergencyService {
  static async getEmergencyContacts() {
    if (!isDbConnected()) return [];
    return await prisma.emergencyContact.findMany({
      where: { status: 'ACTIVE' },
      include: {
        location: {
          select: { id: true, name: true, slug: true, latitude: true, longitude: true },
        },
      },
      orderBy: [{ priority: 'asc' }, { name: 'asc' }],
    });
  }

  static async createEmergencyContact(data: any) {
    if (!isDbConnected()) return null;
    return await prisma.emergencyContact.create({
      data,
    });
  }

  static async updateEmergencyContact(id: string, data: any) {
    if (!isDbConnected()) return null;
    return await prisma.emergencyContact.update({
      where: { id },
      data,
    });
  }

  static async deleteEmergencyContact(id: string) {
    if (!isDbConnected()) return null;
    return await prisma.emergencyContact.delete({
      where: { id },
    });
  }
}
