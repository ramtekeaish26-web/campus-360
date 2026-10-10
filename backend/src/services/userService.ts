import { prisma, isDbConnected } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { UpdateProfileInput } from '../validators/userValidators.js';
import { AuthService, DEMO_FALLBACK_USERS } from './authService.js';

export class UserService {
  /**
   * Get user profile details by userId
   */
  static async getProfile(userId: string) {
    const user = await AuthService.getUserWithDetails(userId);
    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.USER_NOT_FOUND);
    }
    return user;
  }

  /**
   * Update allowed fields of the user's profile
   */
  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const { firstName, lastName, phone, bio, avatarUrl } = input;

    if (isDbConnected()) {
      try {
        const existingProfile = await prisma.userProfile.findUnique({
          where: { userId },
        });

        if (!existingProfile) {
          await prisma.userProfile.create({
            data: {
              userId,
              firstName: firstName || 'User',
              lastName: lastName || '',
              phone: phone || null,
              bio: bio || null,
              avatarUrl: avatarUrl || null,
            },
          });
        } else {
          await prisma.userProfile.update({
            where: { userId },
            data: {
              ...(firstName !== undefined && { firstName }),
              ...(lastName !== undefined && { lastName }),
              ...(phone !== undefined && { phone }),
              ...(bio !== undefined && { bio }),
              ...(avatarUrl !== undefined && { avatarUrl }),
            },
          });
        }

        return await UserService.getProfile(userId);
      } catch {
        // DB update error, fallback
      }
    }

    // Fallback in-memory update for development/test mode
    const fallbackUser = Object.values(DEMO_FALLBACK_USERS).find((u) => u.id === userId);
    if (fallbackUser && fallbackUser.profile) {
      if (firstName !== undefined) fallbackUser.profile.firstName = firstName;
      if (lastName !== undefined) fallbackUser.profile.lastName = lastName;
      if (phone !== undefined) fallbackUser.profile.phone = phone;
      if (bio !== undefined) fallbackUser.profile.bio = bio;
      if (avatarUrl !== undefined) fallbackUser.profile.avatarUrl = avatarUrl;
      return fallbackUser;
    }

    throw new AppError('Failed to update profile', 500, ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
}
