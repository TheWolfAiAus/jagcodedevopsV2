import {Router} from 'express';
import {getActionStatus, listActions, toggleAction, triggerAction} from '../controllers/actionController';
import {authenticateToken} from '../middleware/authMiddleware';

const router = Router ();

// Apply authentication middleware to all action routes
router.use (authenticateToken);

// Define routes for action management
router.get ('/list', listActions);
router.post ('/trigger', triggerAction);
router.get ('/:actionName/status', getActionStatus);
router.post ('/:actionName/toggle', toggleAction);

export default router;