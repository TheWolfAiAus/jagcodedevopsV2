"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var actionController_1 = require("../controllers/actionController");
var authMiddleware_1 = require("../middleware/authMiddleware");
var router = (0, express_1.Router)();
// Apply authentication middleware to all action routes
router.use(authMiddleware_1.authenticateToken);
// Define routes for action management
router.get('/list', actionController_1.listActions);
router.post('/trigger', actionController_1.triggerAction);
router.get('/:actionName/status', actionController_1.getActionStatus);
router.post('/:actionName/toggle', actionController_1.toggleAction);
exports.default = router;
//# sourceMappingURL=actionRoutes.js.map