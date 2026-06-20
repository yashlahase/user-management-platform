import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actor = (req.headers['x-actor'] as string) || 'SYSTEM_ADMIN';
      const user = await this.userService.createUser(req.body, actor);
      sendSuccess(res, 'User created successfully', user, 201);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const actor = (req.headers['x-actor'] as string) || 'SYSTEM_ADMIN';
      const user = await this.userService.updateUser(id, req.body, actor);
      sendSuccess(res, 'User updated successfully', user, 200);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      sendSuccess(res, 'User retrieved successfully', user, 200);
    } catch (error) {
      next(error);
    }
  };

  getUsersList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.query is validated and casted by listUsersSchema in validation middleware
      const { page, limit, search, sortBy, sortOrder, status, isDeleted } = req.query as any;

      const { users, total } = await this.userService.getUsersList({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        status,
        isDeleted,
      });

      const totalPages = Math.ceil(total / limit);

      sendPaginatedSuccess(
        res,
        'Users listed successfully',
        users,
        {
          page,
          limit,
          totalItems: total,
          totalPages,
        },
        200
      );
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const actor = (req.headers['x-actor'] as string) || 'SYSTEM_ADMIN';
      const user = await this.userService.deleteUser(id, actor);
      sendSuccess(res, 'User soft-deleted successfully', user, 200);
    } catch (error) {
      next(error);
    }
  };

  restoreUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const actor = (req.headers['x-actor'] as string) || 'SYSTEM_ADMIN';
      const user = await this.userService.restoreUser(id, actor);
      sendSuccess(res, 'User restored successfully', user, 200);
    } catch (error) {
      next(error);
    }
  };
}
