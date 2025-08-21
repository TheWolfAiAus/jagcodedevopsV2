const express = require('express');
const router = express.Router();

// Placeholder for user data (in a real application, this would be in a database)
const users = [
    {id: 1, username: 'admin1', password: 'password1'},
    {id: 2, username: 'admin2', password: 'password2'},
    {id: 3, username: 'admin3', password: 'password3'},
    {id: 4, username: 'admin4', password: 'password4'},
    {id: 5, username: 'admin5', password: 'password5'},
];

// Basic login route
router.post('/login', (req, res) => {
    const {username, password} = req.body;

    // In a real application, you would securely verify credentials against a database
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // In a real application, you would generate a JWT or session token
        res.json({message: 'Login successful', user: {id: user.id, username: user.username}});
    } else {
        res.status(401).json({message: 'Invalid credentials'});
    }
});

module.exports = router;