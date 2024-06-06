import express from 'express';
import { AdminControllers } from './admin.controller';
import { updateAdminValidationSchema } from './admin.validation';
import { validateRequest } from '../../middleWear/validateRequest';

const router = express.Router();

router.get('/', AdminControllers.getAllAdmins);

router.get('/:adminId', AdminControllers.getSingleAdmin);

router.patch(
  '/:adminId',
  validateRequest(updateAdminValidationSchema),
  AdminControllers.updateAdmin,
);

router.delete('/:adminId', AdminControllers.deleteAdmin);

export const AdminRoutes = router;
