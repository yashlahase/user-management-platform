// Repository integration test suite
import { UserRepository } from '../repositories/user.repository';
import { prisma } from '../config/database';

jest.mock('../config/database', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockUserDb = prisma.user as any;

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const mockUser = { id: 'uuid-123', name: 'Yash' };
      mockUserDb.create.mockResolvedValue(mockUser);

      const result = await userRepository.create({
        name: 'Yash',
        email: 'yash@example.com',
        primaryMobile: '9876543210',
        aadhaar: '123456789012',
        pan: 'ABCDE1234F',
        dateOfBirth: new Date(),
        placeOfBirth: 'Delhi',
        currentAddress: 'Address 1',
        permanentAddress: 'Address 2',
        createdBy: 'ADMIN',
      });

      expect(mockUserDb.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update user and increment version if current version matches', async () => {
      const mockUser = { id: 'uuid-123', name: 'New Name', version: 2 };
      mockUserDb.updateMany.mockResolvedValue({ count: 1 });
      mockUserDb.findFirst.mockResolvedValue(mockUser);

      const result = await userRepository.update('uuid-123', { name: 'New Name' }, 1);

      expect(mockUserDb.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'uuid-123',
          version: 1,
          isDeleted: false,
        },
        data: {
          name: 'New Name',
          version: {
            increment: 1,
          },
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if version mismatch occurs (updateMany returns count 0)', async () => {
      mockUserDb.updateMany.mockResolvedValue({ count: 0 });

      const result = await userRepository.update('uuid-123', { name: 'New Name' }, 1);

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should query prisma findFirst filtering out deleted users by default', async () => {
      const mockUser = { id: 'uuid-123', isDeleted: false };
      mockUserDb.findFirst.mockResolvedValue(mockUser);

      const result = await userRepository.findById('uuid-123');

      expect(mockUserDb.findFirst).toHaveBeenCalledWith({
        where: { id: 'uuid-123', isDeleted: false },
      });
      expect(result).toEqual(mockUser);
    });

    it('should query prisma findFirst including deleted users if flag is set', async () => {
      const mockUser = { id: 'uuid-123', isDeleted: true };
      mockUserDb.findFirst.mockResolvedValue(mockUser);

      const result = await userRepository.findById('uuid-123', true);

      expect(mockUserDb.findFirst).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should query prisma with skip, take, and search query filters', async () => {
      const mockUsers = [{ id: '1' }, { id: '2' }];
      mockUserDb.findMany.mockResolvedValue(mockUsers);
      mockUserDb.count.mockResolvedValue(2);

      const result = await userRepository.findAll({
        page: 2,
        limit: 10,
        search: 'Yash',
        sortBy: 'name',
        sortOrder: 'asc',
        status: 'ACTIVE',
      });

      expect(mockUserDb.findMany).toHaveBeenCalled();
      expect(mockUserDb.count).toHaveBeenCalled();
      expect(result).toEqual({ users: mockUsers, total: 2 });
    });
  });

  describe('softDelete', () => {
    it('should flag user as isDeleted and set deletedAt timestamp', async () => {
      const mockUser = { id: 'uuid-123', isDeleted: true };
      mockUserDb.update.mockResolvedValue(mockUser);

      const result = await userRepository.softDelete('uuid-123', 'ADMIN');

      expect(mockUserDb.update).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('restore', () => {
    it('should restore isDeleted to false and clear deletedAt timestamp', async () => {
      const mockUser = { id: 'uuid-123', isDeleted: false, deletedAt: null };
      mockUserDb.update.mockResolvedValue(mockUser);

      const result = await userRepository.restore('uuid-123', 'ADMIN');

      expect(mockUserDb.update).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });
});
