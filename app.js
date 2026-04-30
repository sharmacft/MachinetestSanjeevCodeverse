import express from 'express';
import connectDb from './models/connectDb.js';
import adminRoutes from './routers/adminRoutes.js';
import userRoutes from './routers/userRoutes.js';
import masterRoutes from './routers/masterRoutes.js';
const app = express();
app.use(express.json());
const PORT = 3000;
connectDb();
app.get('/', (req, res) => {
    res.send('Running');
});
app.use('/superadmin', adminRoutes);
app.use('/auth', userRoutes);
app.use('/master', masterRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
