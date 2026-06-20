import { Prisma, User, UserStatus } from '@prisma/client';
import { prisma } from '../config/database';

export class UserRepository {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.UserUpdateInput,
    currentVersion: number
  ): Promise<User | null> {
    // Optimistic Concurrency Control (OCC)
    // We update only if id and version match
    const result = await prisma.user.updateMany({
      where: {
        id,
        version: currentVersion,
        isDeleted: false,
      },
      data: {
        ...data,
        version: {
          increment: 1,
        },
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findById(id);
  }

  async findById(id: string, includeDeleted = false): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });
  }

  async findByEmail(email: string, excludeId?: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email,
        isDeleted: false,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }

  async findByAadhaar(aadhaar: string, excludeId?: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        aadhaar,
        isDeleted: false,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }

  async findByPan(pan: string, excludeId?: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        pan,
        isDeleted: false,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    sortBy: keyof User | 'createdAt';
    sortOrder: 'asc' | 'desc';
    status?: UserStatus;
    isDeleted?: boolean;
  }): Promise<{ users: User[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, status, isDeleted = false } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      isDeleted,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { primaryMobile: { contains: search } },
        { pan: { contains: search } },
        { aadhaar: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const total = await prisma.user.count({ where });

    return { users, total };
  }

  async softDelete(id: string, deletedBy: string): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: { id, isDeleted: false },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedBy: deletedBy,
        },
      });
    } catch (error) {
      // Prisma error if not found
      return null;
    }
  }

  async restore(id: string, restoredBy: string): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: { id, isDeleted: true },
        data: {
          isDeleted: false,
          deletedAt: null,
          updatedBy: restoredBy,
        },
      });
    } catch (error) {
      return null;
    }
  }
}
