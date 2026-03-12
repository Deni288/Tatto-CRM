import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
    getClientGallery,
    addGalleryImage,
    deleteGalleryImage,
} from '../controllers/gallery.controller';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get('/', getClientGallery);
router.post('/', addGalleryImage);
router.delete('/:id', deleteGalleryImage);

export default router;
