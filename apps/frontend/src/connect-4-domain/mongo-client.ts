import mongoose from 'mongoose';

interface MongoDBClientInterface {
    connect: () => void;
}

export default class MongoDBClient implements MongoDBClientInterface {
    connect() {
        if (mongoose.connection.readyState === 0) {
            mongoose.connect(import.meta.env.VITE_MONGODB_URI!);
        }
    }
}
