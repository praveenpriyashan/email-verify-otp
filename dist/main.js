"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const validateEnv_1 = __importDefault(require("./util/validateEnv"));
const mongoose_1 = __importDefault(require("mongoose"));
const port = validateEnv_1.default.PORT || 8081;
mongoose_1.default.connect(validateEnv_1.default.MONGOOSE_CONNECTION_STRING)
    .then(() => {
    console.log('Connected to MongoDB');
    app_1.default.listen(port, () => {
        console.log('Server is running on port :' + port);
    });
})
    .catch((err) => {
    console.log("failed to connect to MongoDB: " + err);
});
//# sourceMappingURL=main.js.map