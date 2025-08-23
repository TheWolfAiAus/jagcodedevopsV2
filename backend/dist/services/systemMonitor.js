"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemMonitor = void 0;
const os = __importStar(require("os"));
class SystemMonitor {
    constructor() {
        this.running = false;
    }
    async start() {
        this.running = true;
        console.log('📊 System Monitor service started');
    }
    async stop() {
        this.running = false;
        console.log('📊 System Monitor service stopped');
    }
    async getStatus() {
        if (!this.running) {
            return {
                service_status: { system_healthy: false },
                message: 'System monitor not running'
            };
        }
        return {
            service_status: { system_healthy: true },
            system_info: {
                platform: os.platform(),
                arch: os.arch(),
                total_memory: os.totalmem(),
                free_memory: os.freemem(),
                cpu_count: os.cpus().length
            },
            uptime: os.uptime()
        };
    }
    async getPerformanceMetrics() {
        const cpus = os.cpus();
        const loadAvg = os.loadavg();
        return {
            current_stats: {
                cpu: {
                    percent: Math.min(loadAvg[0] * 10, 100),
                    cores: cpus.length
                },
                memory: {
                    total: os.totalmem(),
                    free: os.freemem(),
                    used: os.totalmem() - os.freemem()
                },
                load_average: loadAvg
            }
        };
    }
    isRunning() {
        return this.running;
    }
}
exports.SystemMonitor = SystemMonitor;
//# sourceMappingURL=systemMonitor.js.map