module.exports.graphProperties = {
  colors: {
    barColor: "#13b937",
    labelColor: "#222523",
    gridLinesColor: "#c0c4ce",
  },

  barParams: {
    barPadding: 0.2,
    barYPositon: (height, scaleFn, value) => height - scaleFn(value),
  },

  labelParams: {
    fontSize: (scaleFn) => {
      if (scaleFn.bandwidth() >= 110) {
        return scaleFn.bandwidth() / 15;
      } else if (scaleFn.bandwidth() >= 80) {
        return scaleFn.bandwidth() / 6;
      } else if (scaleFn.bandwidth() <= 20) {
        return 0;
      } else {
        return scaleFn.bandwidth() / 3;
      }
    },

    fontWeight: "bold",
    opacityValue: "0",
    textAnchorPosition: "middle",
    letterSpacing: "1",
    labelClass: ".label",
    labelXPosition: (scaleFn, value) =>
      scaleFn(value) + scaleFn.bandwidth() / 2,
    labelYPosition: (scaleFn, value, marginValue) =>
      scaleFn(value) - marginValue / 2,
    visible: 1,
    hidden: 0,
  },

  tooltipParams: {
    tooltipYPosition: (scaleFn, marginValue) =>
      scaleFn.bandwidth() >= 80 ? marginValue * 3 : marginValue * 2,
  },

  axesParams: {
    axesColor: "#798296",
    axesFontSize: "10px",
    axesFontWeight: "bold",
    axesTextAnchor: "end",
    axesTestRotate: -45,
    tickSizeValue: "10",
  },

  strokeWidth: 1,

  visible: "1",
  hidden: "0",
  cursorPointer: "pointer",

  graphId: "barChart",
  labelClass: ".barChart",

  margin: 10,
  graphMargin: { top: 90, left: 20, right: 90, bottom: 150 },

  durationTime: 400,

  clickedLabel: false,
  clickedBar: true,
  clickedClass: "active",
  clickedBarClass: "activeBar",
};
