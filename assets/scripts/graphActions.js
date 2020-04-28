module.exports.graphActions = {
  getContainer: (field) => document.getElementById(field),

  translate: (firstMarginValue, secondMarginValue) =>
    typeof firstMarginValue !== "number" ||
    typeof secondMarginValue !== "number"
      ? `translate(0, 0)`
      : `translate(${firstMarginValue}, ${secondMarginValue})`,

  rotate: (num) => (typeof num !== "number" ? `rotate(0)` : `rotate(${num})`),
};
