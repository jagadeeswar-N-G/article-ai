import express from 'express';
import bodyParser from 'body-parser';
import extractRoutes from './routes/extract';
import embedRoutes from './routes/embed';
import askRoutes from './routes/ask';
import quizRoutes from './routes/quiz';
import { config } from './config';

const app = express();
const PORT = config.port || 3000;

app.use(bodyParser.json());

app.use('/extract', extractRoutes);
app.use('/embed', embedRoutes);
app.use('/ask', askRoutes);
app.use('/quiz', quizRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});