import express from 'express';
import { AdminControllers } from './admin.controller';
import { updateAdminValidationSchema } from './admin.validation';
import { validateRequest } from '../../middleWear/validateRequest';
import { auth } from '../../middleWear/auth';

const router = express.Router();

router.get('/', auth(), AdminControllers.getAllAdmins);

router.get('/:id', AdminControllers.getSingleAdmin);

router.patch(
  '/:id',
  validateRequest(updateAdminValidationSchema),
  AdminControllers.updateAdmin,
);

router.delete('/:id', AdminControllers.deleteAdmin);

export const AdminRoutes = router;
