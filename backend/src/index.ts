
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Middlewares
app.use(cors()); // allow requests from frontend
app.use(express.json({ limit: '5mb' })); // parse JSON bodies

// ✅ Route imports
import extractRouter from './routes/extract';
import embedRouter from './routes/embed';
import askRouter from './routes/ask';
import quizRouter from './routes/quiz';

// ✅ Routes
app.use('/extract', extractRouter);
app.use('/embed', embedRouter);
app.use('/ask', askRouter);
app.use('/quiz', quizRouter);

// ✅ Default root route
app.get('/', (req, res) => {
  res.send('🧠 AI Article Service is running');
});

// ❌ Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
