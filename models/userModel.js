import mongoose from "mongoose";

const { Schema } = mongoose;

const publicUserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      default: "public_user",
    },
  },
  {
    timestamps: true,
  }
);

const tenantUserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      default: "master_user",
    },
    masterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Master",
    },
  },
  {
    timestamps: true,
  }
);

const publicDataSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      default: null,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const tenantDataSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      default: null,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    masterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Master",
    },
  },
  {
    timestamps: true,
  }
);

export const PublicUser = mongoose.model("PublicUser", publicUserSchema);
export const PublicData = mongoose.model("PublicData", publicDataSchema);

export const getTenantUserModel = (connection) => {
  return connection.models.TenantUser || connection.model("TenantUser", tenantUserSchema);
};

export const getTenantDataModel = (connection) => {
  return connection.models.TenantData || connection.model("TenantData", tenantDataSchema);
};
