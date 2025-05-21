"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = require("./routes/userRoutes");
const matchRoutes_1 = require("./routes/matchRoutes");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/users', userRoutes_1.userRoutes);
app.use('/api/matches', matchRoutes_1.matchRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
