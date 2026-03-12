import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
    getClientConsentForms,
    createConsentForm,
} from '../controllers/consent.controller';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get('/', getClientConsentForms);
router.post('/', createConsentForm);

export default router;
