import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { ConflictError, NotFoundError } from '../utils/errors';
import { UserStatus } from '@prisma/client';

jest.mock('../repositories/user.repository');

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new UserRepository() as any;
    userService = new UserService();
    (userService as any).userRepository = mockRepository;
  });

  describe('createUser', () => {
    const userInput = {
      name: 'Yash Sharma',
      email: 'yash@example.com',
      primaryMobile: '9876543210',
      aadhaar: '123456789012',
      pan: 'ABCDE1234F',
      dateOfBirth: new Date('1995-08-15'),
      placeOfBirth: 'Delhi',
      currentAddress: 'Address 1',
      permanentAddress: 'Address 2',
      status: UserStatus.ACTIVE,
    };

    it('should create user if email, Aadhaar, and PAN are unique', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByAadhaar.mockResolvedValue(null);
      mockRepository.findByPan.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({ id: 'uuid-123', ...userInput, secondaryMobile: null, version: 1, createdAt: new Date(), updatedAt: new Date(), deletedAt: null, isDeleted: false, createdBy: 'ADMIN', updatedBy: null, remarks: null });

      const result = await userService.createUser(userInput, 'ADMIN');

      expect(mockRepository.create).toHaveBeenCalled();
      expect(result.id).toBe('uuid-123');
    });

    it('should throw ConflictError if email is duplicate', async () => {
      mockRepository.findByEmail.mockResolvedValue({ id: 'existing-id' } as any);

      await expect(userService.createUser(userInput, 'ADMIN')).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if Aadhaar is duplicate', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByAadhaar.mockResolvedValue({ id: 'existing-id' } as any);

      await expect(userService.createUser(userInput, 'ADMIN')).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError if PAN is duplicate', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByAadhaar.mockResolvedValue(null);
      mockRepository.findByPan.mockResolvedValue({ id: 'existing-id' } as any);

      await expect(userService.createUser(userInput, 'ADMIN')).rejects.toThrow(ConflictError);
    });
  });

  describe('updateUser', () => {
    const updateInput = {
      name: 'Yash Sharma Updated',
      version: 1,
    };

    it('should throw NotFoundError if user does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(userService.updateUser('uuid-123', updateInput)).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if OCC version check fails', async () => {
      mockRepository.findById.mockResolvedValue({ id: 'uuid-123', version: 1 } as any);
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByAadhaar.mockResolvedValue(null);
      mockRepository.findByPan.mockResolvedValue(null);
      // repository.update returns null on OCC conflict
      mockRepository.update.mockResolvedValue(null);

      await expect(userService.updateUser('uuid-123', updateInput)).rejects.toThrow(ConflictError);
    });

    it('should succeed and return updated user on matching version', async () => {
      const existing = { id: 'uuid-123', version: 1 };
      mockRepository.findById.mockResolvedValue(existing as any);
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByAadhaar.mockResolvedValue(null);
      mockRepository.findByPan.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue({ id: 'uuid-123', name: 'Yash Sharma Updated', version: 2 } as any);

      const result = await userService.updateUser('uuid-123', updateInput, 'ADMIN');

      expect(mockRepository.update).toHaveBeenCalled();
      expect(result.version).toBe(2);
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      mockRepository.findById.mockResolvedValue({ id: 'uuid-123' } as any);

      const result = await userService.getUserById('uuid-123');

      expect(result.id).toBe('uuid-123');
    });

    it('should throw NotFoundError if user not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById('uuid-123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteUser', () => {
    it('should delegate to repository softDelete', async () => {
      mockRepository.softDelete.mockResolvedValue({ id: 'uuid-123', isDeleted: true } as any);

      const result = await userService.deleteUser('uuid-123', 'ADMIN');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('uuid-123', 'ADMIN');
      expect(result.isDeleted).toBe(true);
    });

    it('should throw NotFoundError if user to delete not found', async () => {
      mockRepository.softDelete.mockResolvedValue(null);

      await expect(userService.deleteUser('uuid-123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('restoreUser', () => {
    it('should delegate to repository restore', async () => {
      mockRepository.restore.mockResolvedValue({ id: 'uuid-123', isDeleted: false } as any);

      const result = await userService.restoreUser('uuid-123', 'ADMIN');

      expect(mockRepository.restore).toHaveBeenCalledWith('uuid-123', 'ADMIN');
      expect(result.isDeleted).toBe(false);
    });

    it('should throw NotFoundError if user to restore not found', async () => {
      mockRepository.restore.mockResolvedValue(null);

      await expect(userService.restoreUser('uuid-123')).rejects.toThrow(NotFoundError);
    });
  });
});
