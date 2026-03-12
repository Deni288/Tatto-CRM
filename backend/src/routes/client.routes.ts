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

const router = Router();

router.use(requireAuth);

router.use('/:clientId/consent-forms', consentRoutes);

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
