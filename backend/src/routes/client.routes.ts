import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
} from '../controllers/client.controller';

import consentRoutes from './consent.routes';
import galleryRoutes from './gallery.routes';

const router = Router();

router.use(requireAuth);

router.use('/:clientId/consent-forms', consentRoutes);
router.use('/:clientId/gallery', galleryRoutes);

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
