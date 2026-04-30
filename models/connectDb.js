import mongoose from 'mongoose';

const connectDb = async () => {
    try {
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/machinTestCodeverse');
        console.log(`MongoDB Connected`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

export default connectDb;