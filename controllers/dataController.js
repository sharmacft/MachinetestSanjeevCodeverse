import { PublicData, getTenantDataModel } from "../models/userModel.js";
import { getTenantDb } from "../models/connectDb.js";

const getDataModelForRequest = async (req) => {
  if (req.user.role === "master_user") {
    const tenantDb = await getTenantDb(req.user.dbName);
    return getTenantDataModel(tenantDb);
  }

  if (req.user.role === "public_user") {
    return PublicData;
  }

  throw new Error("Only application users can access data records");
};

const buildDataPayload = (req) => {
  const payload = {
    title: req.body.title,
    value: req.body.value,
    ownerId: req.user.id,
  };

  if (req.user.role === "master_user") {
    payload.masterId = req.user.masterId;
  }

  return payload;
};

export const createData = async (req, res) => {
  try {
    if (!["public_user", "master_user"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const DataModel = await getDataModelForRequest(req);
    const record = await DataModel.create(buildDataPayload(req));
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllData = async (req, res) => {
  try {
    if (!["public_user", "master_user"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const DataModel = await getDataModelForRequest(req);
    const records = await DataModel.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getDataById = async (req, res) => {
  try {
    const DataModel = await getDataModelForRequest(req);
    const record = await DataModel.findOne({ _id: req.params.id, ownerId: req.user.id });

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateData = async (req, res) => {
  try {
    const DataModel = await getDataModelForRequest(req);
    const record = await DataModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      { $set: { title: req.body.title, value: req.body.value } },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteData = async (req, res) => {
  try {
    const DataModel = await getDataModelForRequest(req);
    const record = await DataModel.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
