import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { getArtists, getAdminStats, toggleArtist } from '../controllers/admin.controller';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/artists', getArtists);
router.patch('/artists/:id/toggle', toggleArtist);

export default router;
