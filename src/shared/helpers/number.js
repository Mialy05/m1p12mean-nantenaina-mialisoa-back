const formatNumber = (number) => {
  if (typeof number !== "number") {
    throw new Error("Le paramètre doit être un nombre.");
  }

  const [integerPart, decimalPart] = number.toFixed(2).split(".");

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  if (decimalPart != "00") {
    return `${formattedInteger},${decimalPart}`;
  } else {
    return `${formattedInteger}`;
  }
};

const roundNumberTo2 = (nombre) => {
  return Math.round(nombre * 100) / 100;
};

module.exports = { formatNumber, roundNumberTo2 };
