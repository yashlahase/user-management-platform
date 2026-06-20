import { User } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserInput, UpdateUserInput, ListUsersQuery } from '../validators/user.validator';
import { ConflictError, NotFoundError } from '../utils/errors';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(input: CreateUserInput, actor = 'SYSTEM_ADMIN'): Promise<User> {
    // 1. Duplicate checks
    await this.checkDuplicates(input.email, input.aadhaar, input.pan);

    // 2. Map schema and insert
    return this.userRepository.create({
      ...input,
      createdBy: actor,
      version: 1,
    });
  }

  async updateUser(id: string, input: UpdateUserInput, actor = 'SYSTEM_ADMIN'): Promise<User> {
    const { version, ...updateData } = input;

    // 1. Fetch user to verify existence and check duplicate exclusions
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError(`User with ID ${id} not found.`);
    }

    // 2. Unique constraints validation
    await this.checkDuplicates(
      updateData.email || null,
      updateData.aadhaar || null,
      updateData.pan || null,
      id
    );

    // 3. Perform update with Optimistic Concurrency Control (OCC)
    const updatedUser = await this.userRepository.update(
      id,
      {
        ...updateData,
        updatedBy: actor,
      },
      version
    );

    if (!updatedUser) {
      // Fetch user again to see if it was modified by someone else or deleted
      const checkUser = await this.userRepository.findById(id);
      if (!checkUser) {
        throw new NotFoundError(`User with ID ${id} was deleted or does not exist.`);
      }
      throw new ConflictError(
        'User was updated by another request. Please refresh and try again.'
      );
    }

    return updatedUser;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found.`);
    }
    return user;
  }

  async getUsersList(query: ListUsersQuery): Promise<{ users: User[]; total: number }> {
    return this.userRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      status: query.status,
      isDeleted: query.isDeleted,
    });
  }

  async deleteUser(id: string, actor = 'SYSTEM_ADMIN'): Promise<User> {
    const deletedUser = await this.userRepository.softDelete(id, actor);
    if (!deletedUser) {
      throw new NotFoundError(`User with ID ${id} not found or already deleted.`);
    }
    return deletedUser;
  }

  async restoreUser(id: string, actor = 'SYSTEM_ADMIN'): Promise<User> {
    const restoredUser = await this.userRepository.restore(id, actor);
    if (!restoredUser) {
      throw new NotFoundError(`User with ID ${id} is not deleted or does not exist.`);
    }
    return restoredUser;
  }

  private async checkDuplicates(
    email: string | null,
    aadhaar: string | null,
    pan: string | null,
    excludeId?: string
  ): Promise<void> {
    if (email) {
      const duplicateEmail = await this.userRepository.findByEmail(email, excludeId);
      if (duplicateEmail) {
        throw new ConflictError(`Email address '${email}' is already registered.`);
      }
    }

    if (aadhaar) {
      const duplicateAadhaar = await this.userRepository.findByAadhaar(aadhaar, excludeId);
      if (duplicateAadhaar) {
        throw new ConflictError(`Aadhaar number '${aadhaar}' is already registered.`);
      }
    }

    if (pan) {
      const duplicatePan = await this.userRepository.findByPan(pan, excludeId);
      if (duplicatePan) {
        throw new ConflictError(`PAN number '${pan}' is already registered.`);
      }
    }
  }
}
