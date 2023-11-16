import { dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

export const __dirname = dirname(fileURLToPath(import.meta.url));

//BCRYPT
export const hashData = async (data) => {
  return bcrypt.hash(data, 10);
};

export const compareData = (data, hashedData) => {
  return bcrypt.compare(data, hashedData);
};
