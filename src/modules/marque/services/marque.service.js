import Marque from "../../../models/Marque.js";

export const findAllMarque = async () => {
  return Marque.find();
};

// module.exports = {
//   findAllMarque,
// };
