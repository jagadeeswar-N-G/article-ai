import dotenv from 'dotenv';

dotenv.config();

const config = {
    PORT: process.env.PORT || 3000,
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/myapp',
    EMBEDDING_SERVICE_URL: process.env.EMBEDDING_SERVICE_URL || 'http://localhost:5000/embed',
    QDRANT_URL: process.env.QDRANT_URL || 'http://localhost:6333',
    API_KEY: process.env.API_KEY || '',
};

export default config;