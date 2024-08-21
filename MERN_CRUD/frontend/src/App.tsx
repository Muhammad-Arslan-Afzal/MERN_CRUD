import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

interface IUser {
  _id: string; // Add _id to the IUser interface to track user ID
  name: string;
}

function App() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [newUser, setNewUser] = useState<string>('');
  const [editingUser, setEditingUser] = useState<IUser | null>(null); // Track which user is being edited

  // Fetch users on component mount
  useEffect(() => {
    axios.get("http://localhost:5000/users")
      .then((response) => setUsers(response.data))
      .catch((error) => console.log(error));
  }, []);

  const handleAddUser = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (editingUser) {
        // If we are editing a user, send a PUT request
        const response = await axios.put(`http://localhost:5000/users/${editingUser._id}`, { name: newUser });
        setUsers(response.data);
        setEditingUser(null); // Clear the editing state
      } else {
        // If not editing, add a new user
        const response = await axios.post("http://localhost:5000/users", { name: newUser });
        setUsers(response.data);
      }

      // Clear the input field
      setNewUser('');
    } catch (error) {
      console.error('There was an error adding or updating the user:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await axios.delete(`http://localhost:5000/users/${id}`);
      setUsers(response.data);
    } catch (error) {
      console.error('There was an error deleting the user:', error);
    }
  };

  const handleEditUser = (user: IUser) => {
    setEditingUser(user);
    setNewUser(user.name); // Pre-fill the input field with the user's current name
  };

  return (
    <div className="App">
      <h1>Frontend</h1>
      <form onSubmit={handleAddUser}>
        <label htmlFor="newUser">User Name</label>
        <input
          type='text'
          placeholder='Enter here'
          name='name'
          id="newUser"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
        />
        <button type='submit'>{editingUser ? 'Update' : 'Add'}</button>
      </form>
      <ul>
        {users.map(user => (
          <li key={user._id}>
            {user.name}
            <button onClick={() => handleEditUser(user)}>Edit</button>
            <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
