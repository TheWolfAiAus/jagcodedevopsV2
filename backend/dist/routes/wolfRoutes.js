"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/pack', async (req, res) => {
    try {
        res.json({ message: 'Wolf pack routes - coming soon' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=wolfRoutes.js.map