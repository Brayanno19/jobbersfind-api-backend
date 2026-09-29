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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var prisma = new client_1.PrismaClient();
// Liste des mots vides (stop words) à ignorer lors de l'extraction des mots-clés
var STOP_WORDS = new Set([
    'de', 'la', 'les', 'des', 'du', 'et', 'en', 'pour', 'un', 'une', 'le', 'au', 'aux',
    'sur', 'dans', 'avec', 'sans', 'sous', 'par', 'qui', 'que', 'quoi', 'dont', 'ou',
    'technicien', 'ingénieur', 'spécialiste', 'opérateur', 'agent', 'gestionnaire', 'chef',
    'directeur', 'responsable', 'assistant', 'expert', 'artisan', 'professionnel'
]);
function getSectorStyle(sector) {
    if (sector.includes('Agriculture') || sector.includes('Forêt')) {
        return { icon: 'agriculture', color: '0xFF4CAF50' }; // Vert
    }
    if (sector.includes('BTP') || sector.includes('Civil') || sector.includes('Construction')) {
        return { icon: 'construction', color: '0xFFFF9800' }; // Orange
    }
    if (sector.includes('Énergie') || sector.includes('Mines')) {
        return { icon: 'bolt', color: '0xFFFFC107' }; // Jaune
    }
    if (sector.includes('Technologies') || sector.includes('Numérique')) {
        return { icon: 'computer', color: '0xFF2196F3' }; // Bleu
    }
    if (sector.includes('Santé') || sector.includes('Médical')) {
        return { icon: 'local_hospital', color: '0xFFF44336' }; // Rouge
    }
    if (sector.includes('Éducation') || sector.includes('Formation')) {
        return { icon: 'school', color: '0xFF9C27B0' }; // Violet
    }
    if (sector.includes('Transport') || sector.includes('Logistique')) {
        return { icon: 'local_shipping', color: '0xFF607D8B' }; // Bleu Gris
    }
    if (sector.includes('Commerce') || sector.includes('Distribution')) {
        return { icon: 'storefront', color: '0xFF00BCD4' }; // Cyan
    }
    if (sector.includes('Artisanat') || sector.includes('Maintenance')) {
        return { icon: 'handyman', color: '0xFF795548' }; // Marron
    }
    if (sector.includes('Finance') || sector.includes('Gestion')) {
        return { icon: 'account_balance', color: '0xFF3F51B5' }; // Indigo
    }
    if (sector.includes('Hôtellerie') || sector.includes('Restauration') || sector.includes('Tourisme')) {
        return { icon: 'restaurant', color: '0xFFE91E63' }; // Rose
    }
    return { icon: 'work', color: '0xFF9E9E9E' }; // Gris par défaut
}
function extractKeywords(metier, description) {
    var text = "".concat(metier, " ").concat(description).toLowerCase();
    // Remplacer la ponctuation par des espaces
    var words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()']/g, " ").split(/\s+/);
    var keywordCounts = {};
    words.forEach(function (word) {
        // Normaliser pour enlever les accents
        var normalized = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (normalized.length > 2 && !STOP_WORDS.has(normalized) && !STOP_WORDS.has(word)) {
            keywordCounts[normalized] = (keywordCounts[normalized] || 0) + 1;
        }
    });
    // Trier par occurrence décroissante, puis prendre les 10 meilleurs
    var sortedWords = Object.keys(keywordCounts)
        .sort(function (a, b) { return keywordCounts[b] - keywordCounts[a]; })
        .slice(0, 10);
    return sortedWords.map(function (word, index) { return ({
        word: word,
        weight: index < 3 ? 5 : (index < 6 ? 4 : 3) // Poids : 5 pour les 3 premiers, 4 pour les 3 suivants, 3 pour le reste
    }); });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, fileData, jobs, successCount, errorCount, _loop_1, _i, jobs_1, job;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Lecture du fichier job.json...');
                    filePath = path.join(__dirname, '../../job.json');
                    if (!fs.existsSync(filePath)) {
                        console.error("Le fichier ".concat(filePath, " n'existe pas."));
                        process.exit(1);
                    }
                    fileData = fs.readFileSync(filePath, 'utf-8');
                    jobs = JSON.parse(fileData);
                    console.log("D\u00E9but du seeding de ".concat(jobs.length, " m\u00E9tiers (Mode UPSERT S\u00E9curis\u00E9)..."));
                    successCount = 0;
                    errorCount = 0;
                    _loop_1 = function (job) {
                        var metierStr, metier, _b, icon, color, keywords, domain_1, e_1;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (!job.metier)
                                        return [2 /*return*/, "continue"];
                                    metierStr = job.metier.trim();
                                    metier = metierStr.charAt(0).toUpperCase() + metierStr.slice(1);
                                    _b = getSectorStyle(job.secteur || ''), icon = _b.icon, color = _b.color;
                                    keywords = extractKeywords(metier, job.description || '');
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 6, , 7]);
                                    return [4 /*yield*/, prisma.jobDomain.upsert({
                                            where: { name: metier },
                                            update: {
                                                description: job.description || '',
                                                icon: icon,
                                                color: color,
                                                isActive: true
                                            },
                                            create: {
                                                name: metier,
                                                description: job.description || '',
                                                icon: icon,
                                                color: color,
                                                isActive: true
                                            },
                                        })];
                                case 2:
                                    domain_1 = _c.sent();
                                    // 2. Remplacement des mots-clés
                                    return [4 /*yield*/, prisma.searchKeyword.deleteMany({
                                            where: { domainId: domain_1.id }
                                        })];
                                case 3:
                                    // 2. Remplacement des mots-clés
                                    _c.sent();
                                    if (!(keywords.length > 0)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, prisma.searchKeyword.createMany({
                                            data: keywords.map(function (kw) { return ({
                                                word: kw.word,
                                                weight: kw.weight,
                                                domainId: domain_1.id
                                            }); })
                                        })];
                                case 4:
                                    _c.sent();
                                    _c.label = 5;
                                case 5:
                                    successCount++;
                                    return [3 /*break*/, 7];
                                case 6:
                                    e_1 = _c.sent();
                                    console.error("\u274C Erreur sur ".concat(metier, ":"), e_1);
                                    errorCount++;
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, jobs_1 = jobs;
                    _a.label = 1;
                case 1:
                    if (!(_i < jobs_1.length)) return [3 /*break*/, 4];
                    job = jobs_1[_i];
                    return [5 /*yield**/, _loop_1(job)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('====================================');
                    console.log("Seeding termin\u00E9 : ".concat(successCount, " m\u00E9tiers ins\u00E9r\u00E9s/mis \u00E0 jour."));
                    if (errorCount > 0)
                        console.log("Erreurs rencontr\u00E9es : ".concat(errorCount));
                    console.log('====================================');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('Erreur globale lors du seeding:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
