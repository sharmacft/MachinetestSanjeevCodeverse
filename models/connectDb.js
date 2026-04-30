import mongoose from "mongoose";

const DEFAULT_DB_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/machinTestCodeverse";

const tenantConnections = new Map();

export const connectDb = async () => {
  try {
    await mongoose.connect(DEFAULT_DB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export const getDefaultConnection = () => mongoose.connection;

export const getTenantDb = async (dbName) => {
  if (!dbName) {
    throw new Error("Tenant database name is required");
  }

  if (tenantConnections.has(dbName)) {
    const existingConnection = tenantConnections.get(dbName);
    if (existingConnection.readyState === 1) {
      return existingConnection;
    }
    await existingConnection.asPromise();
    return existingConnection;
  }

  const tenantUri = `${DEFAULT_DB_URI.split("?")[0].replace(/\/[^/]+$/, "")}/${dbName}`;
  const connection = mongoose.createConnection(tenantUri);
  tenantConnections.set(dbName, connection);
  await connection.asPromise();
  return connection;
};

export default connectDb;
