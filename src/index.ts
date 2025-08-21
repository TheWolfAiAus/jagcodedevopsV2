<<<<<<< HEAD
import express from 'express';
import dotenv from 'dotenv';

dotenv.config ();

const app = express ();
const port = process.env.PORT || 3000;

app.use (express.json ());

app.get ('/', (req, res) => {
    res.send ('Express server is running');
});

app.listen (port, () => {
    console.log (`Server is running on http://localhost:${port}`);
});
=======
// Root barrel for src - re-export grouped modules
export * from './components';
export * from './hooks';
export * from './middleware';
export * from './models';
export * from './routes';

>>>>>>> 4c1bae1a92ab915d3d9790805b2885428143b1c8
