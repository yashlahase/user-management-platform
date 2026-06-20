import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  createUserSchema,
  updateUserSchema,
  listUsersSchema,
  idParamSchema,
} from '../validators/user.validator';

const router = Router();
const userController = new UserController();

router.post(
  '/',
  validateRequest({ body: createUserSchema }),
  userController.createUser
);

router.get(
  '/',
  validateRequest({ query: listUsersSchema }),
  userController.getUsersList
);

router.get(
  '/:id',
  validateRequest({ params: idParamSchema }),
  userController.getUserById
);

router.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateUserSchema }),
  userController.updateUser
);

router.delete(
  '/:id',
  validateRequest({ params: idParamSchema }),
  userController.deleteUser
);

router.patch(
  '/:id/restore',
  validateRequest({ params: idParamSchema }),
  userController.restoreUser
);

export default router;
