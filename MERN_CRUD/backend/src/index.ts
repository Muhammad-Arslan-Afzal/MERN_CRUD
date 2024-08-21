
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const connectDB = async () => {
  try {
    // Database URI from environment variables
    const dbURI = process.env.MONGO_URI as string;

    if (!dbURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Connect to MongoDB
    await mongoose.connect(dbURI);

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure code
  }
};

///////////////////////////////////////////////////////////////////
/////////////////////////DB MODEL//////////////////////////////////
///////////////////////////////////////////////////////////////////
import { Schema, model, Document } from 'mongoose';

// Define the TypeScript interface for the User
interface IUser extends Document {
  _id: string; // Add _id to the IUser interface to track user ID
  name: string;
}

// Define the Mongoose schema for the User
const userSchema = new Schema<IUser>({
  name: { type: String }
});

// Create the Mongoose model
const User = model<IUser>('User', userSchema);

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
// Connect to MongoDB
connectDB();
const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// Define your routes here
app.get("/", (req: Request, res: Response) => {
  res.send('<h1>Welcome: My First CRUD App</h1>');
});

app.get("/users", async (req: Request, res: Response) => {
  const allUsers = await User.find();
  res.send(allUsers);
})

// Adding a new user
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    // Ensure newUser is provided
    if (!name) {
      return res.status(400).json({ error: 'User Name is required' });
    }

    // Create a new User instance with the provided name
    const user = new User({ name });

    // Save the new user to the database
    await user.save();

    // Respond with the updated list of users
    const allUsers = await User.find();
    res.send(allUsers);
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Delete a user
app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the user by ID and delete it
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with the updated list of users after deletion
    const allUsers = await User.find();
    res.send(allUsers);
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Edit a user
app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'User name is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with the updated list of users
    const allUsers = await User.find();
    res.send(allUsers);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Start the server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});