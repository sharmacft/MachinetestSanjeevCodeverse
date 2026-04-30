export const isValidEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
};

export const requireFields = (payload, fields) => {
  const missingFields = fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  if (missingFields.length > 0) {
    const error = new Error(`Missing required fields: ${missingFields.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
};

export const ensureEmail = (email, fieldName = "email") => {
  if (!isValidEmail(email)) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
};

export const ensureMinLength = (value, minLength, fieldName) => {
  if (String(value || "").length < minLength) {
    const error = new Error(`${fieldName} must be at least ${minLength} characters long`);
    error.statusCode = 400;
    throw error;
  }
};

export const getStatusCode = (error, fallbackStatus = 500) => {
  return error.statusCode || fallbackStatus;
};
