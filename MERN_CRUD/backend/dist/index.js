"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Database URI from environment variables
        const dbURI = process.env.MONGO_URI;
        if (!dbURI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        // Connect to MongoDB
        yield mongoose_1.default.connect(dbURI);
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit process with failure code
    }
});
///////////////////////////////////////////////////////////////////
/////////////////////////DB MODEL//////////////////////////////////
///////////////////////////////////////////////////////////////////
const mongoose_2 = require("mongoose");
// Define the Mongoose schema for the User
const userSchema = new mongoose_2.Schema({
    name: { type: String }
});
// Create the Mongoose model
const User = (0, mongoose_2.model)('User', userSchema);
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Connect to MongoDB
connectDB();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // for parsing application/json
app.use(express_1.default.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// Define your routes here
app.get("/", (req, res) => {
    res.send('<h1>Welcome: My First CRUD App</h1>');
});
app.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield User.find();
    res.send(allUsers);
}));
// Adding a new user
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        // Ensure newUser is provided
        if (!name) {
            return res.status(400).json({ error: 'User Name is required' });
        }
        // Create a new User instance with the provided name
        const user = new User({ name });
        // Save the new user to the database
        yield user.save();
        // Respond with the updated list of users
        const allUsers = yield User.find();
        res.send(allUsers);
    }
    catch (err) {
        console.error('Error saving user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Delete a user
app.delete('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find the user by ID and delete it
        const deletedUser = yield User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Respond with the updated list of users after deletion
        const allUsers = yield User.find();
        res.send(allUsers);
    }
    catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Edit a user
app.put('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'User name is required' });
        }
        const updatedUser = yield User.findByIdAndUpdate(id, { name }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Respond with the updated list of users
        const allUsers = yield User.find();
        res.send(allUsers);
    }
    catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
