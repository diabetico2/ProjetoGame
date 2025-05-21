import express from 'express';
import cors from 'cors';
import { userRoutes } from './routes/userRoutes';
import { matchRoutes } from './routes/matchRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 