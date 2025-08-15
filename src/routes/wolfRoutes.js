"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var wolfController_1 = require("../controllers/wolfController");
var authMiddleware_1 = require("../middleware/authMiddleware");
var router = (0, express_1.Router)();
// Apply authentication middleware to all wolf routes
router.use(authMiddleware_1.authenticateToken);
// Define a route for initiating research
router.post('/research', wolfController_1.runResearch);
exports.default = router;
//# sourceMappingURL=wolfRoutes.js.map