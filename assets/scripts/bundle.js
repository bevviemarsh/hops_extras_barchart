(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports.DOMElements = {
  buttons: {
    dataBtns: document.querySelectorAll("button#btn"),
    firstDecadeBtn: document.querySelector(".earlierBtn"),
    secondDecadeBtn: document.querySelector(".laterBtn"),
    labelBtn: document.querySelector("button.labelsBtn"),
    clearBtn: document.querySelector(".clearBtn"),
  },

  inputs: {
    select: document.querySelector(".selectedSet"),
  },

  containers: {
    barInfo: document.querySelector(".barInfo"),
  },
};

},{}],2:[function(require,module,exports){
(function IIFE() {
  const barChart = (function () {
    const unique = require("uniq");
    const { dataProperties } = require("./dataProperties");
    const { graphProperties } = require("./graphProperties");
    const { dataActions } = require("./dataActions");
    const { graphActions } = require("./graphActions");
    const { DOMElements } = require("./DOMElements");

    const DATA = (optionValue) =>
      `https://api.punkapi.com/v2/beers?page=${optionValue}`;

    const getCalculatedSVGAndGraphParams = (chartField) => {
      const { margin, graphMargin } = graphProperties;
      const { getContainer, translate } = graphActions;

      const mainContainer = (chartField) => getContainer(chartField);

      const basicWidth = mainContainer(chartField).offsetWidth;
      const calculatedSvgWidth = basicWidth - margin;
      const calculatedGraphWidth =
        calculatedSvgWidth - graphMargin.left - graphMargin.right;

      const basicHeight = mainContainer(chartField).offsetHeight;
      const calculatedSvgHeight = basicHeight - margin;
      const calculatedGraphHeight =
        calculatedSvgHeight - graphMargin.top - graphMargin.bottom;

      const graphPosition = translate(graphMargin.right, graphMargin.top);

      return {
        mainContainer,
        basicWidth,
        calculatedSvgWidth,
        calculatedGraphWidth,
        basicHeight,
        calculatedSvgHeight,
        calculatedGraphHeight,
        graphPosition,
      };
    };

    const {
      mainContainer,
      basicWidth,
      calculatedSvgWidth,
      calculatedGraphWidth,
      basicHeight,
      calculatedSvgHeight,
      calculatedGraphHeight,
      graphPosition,
    } = getCalculatedSVGAndGraphParams(graphProperties.graphId);

    const getCreatedSVGAndGraph = (chartField) => {
      const svgSelection = d3.select(mainContainer(chartField)).append("svg");

      const mainSvg = svgSelection
        .attr("width", basicWidth)
        .attr("height", basicHeight)
        .append("g");

      const mainChart = mainSvg
        .attr("width", calculatedSvgWidth)
        .attr("height", calculatedSvgHeight)
        .attr("transform", graphPosition)
        .append("g");

      const gridLinesGroup = mainChart.append("g");
      const xAxisGroup = mainChart.append("g");
      const yAxisGroup = mainChart.append("g");
      const barGroup = mainChart.append("g");
      const labelGroup = mainChart.append("g");

      return {
        gridLinesGroup,
        xAxisGroup,
        yAxisGroup,
        barGroup,
        labelGroup,
      };
    };

    const {
      gridLinesGroup,
      xAxisGroup,
      yAxisGroup,
      barGroup,
      labelGroup,
    } = getCreatedSVGAndGraph(graphProperties.graphId);

    const getProperPeriod = (data) => {
      if (!data.length) {
        return;
      }

      const { periodRange, cutMonth, firstBrewedProperty } = dataProperties;
      const { getEarlierPeriod, getLaterPeriod } = dataActions;

      const dataBeforePeriodRange = getEarlierPeriod(
        data,
        firstBrewedProperty,
        cutMonth,
        periodRange
      );
      const dataAfterPeriodRange = getLaterPeriod(
        data,
        firstBrewedProperty,
        cutMonth,
        periodRange
      );

      return getPreparedData(dataBeforePeriodRange, dataAfterPeriodRange);
    };

    const getPreparedData = (dataBeforeperiodRange, dataAfterperiodRange) => {
      const {
        firstBrewedProperty,
        ingredientsProperty,
        hopsProperty,
        amountProperty,
        valueProperty,
      } = dataProperties;

      const { getHopsValues, getHopsSum } = dataActions;

      const getModifiedData = (data) =>
        data.map((d) => ({
          id: d.id,
          name: d.name,
          amount: getHopsSum(
            getHopsValues(
              d,
              ingredientsProperty,
              hopsProperty,
              amountProperty,
              valueProperty
            )
          ),
          year: d[firstBrewedProperty],
          abv: d.abv,
          ibu: d.ibu,
          hops: d[ingredientsProperty][hopsProperty].map((dd) => ({
            name: dd.name,
            value: dd[amountProperty][valueProperty],
            attribute: dd.attribute,
          })),
        }));

      const firstDecade = getModifiedData(dataBeforeperiodRange);
      const secondDecade = getModifiedData(dataAfterperiodRange);

      return getBarChartData(firstDecade, secondDecade);
    };

    const getBarChartData = (firstDecade, secondDecade) => {
      const { noData, cutName } = dataProperties;
      const { checkIfTrue, getHopsInfo } = dataActions;

      const getCalculatedBarChartData = (data) =>
        data.map((d) => ({
          id: d.id,
          x: checkIfTrue(
            d.name.length > cutName,
            `${d.name.substr(0, cutName)}...`,
            d.name
          ),
          y: d.amount,
          text: d.amount.toFixed(1),
          tooltipInfo: {
            year: checkIfTrue(d.year, d.year, noData),
            abv: checkIfTrue(d.abv, d.abv, noData),
            ibu: checkIfTrue(d.ibu, d.ibu, noData),
            hopsInfo: d.hops.map((dd) =>
              getHopsInfo(dd, checkIfTrue, noData, "name", "value", "attribute")
            ),
          },
        }));

      const firstDecadeBarChartData = getCalculatedBarChartData(firstDecade);
      const secondDecadeBarChartData = getCalculatedBarChartData(secondDecade);

      return handleUpdatedData(
        firstDecadeBarChartData,
        secondDecadeBarChartData
      );
    };

    const handleUpdatedData = (
      firstDecadeBarChartData,
      secondDecadeBarChartData
    ) => {
      const { clickedClass } = graphProperties;
      const { buttons } = DOMElements;
      const { firstDecadeBtn, secondDecadeBtn } = buttons;

      const firstDecadeDataset = firstDecadeBarChartData;
      const secondDecadeDataset = secondDecadeBarChartData;

      const handleUpdatedElements = (e, dataset, classType) => {
        if (e.target.classList.contains(classType)) {
          return;
        }

        update(dataset);
        resetEvents(classType);
        e.target.classList.add(classType);
        handleEvents();
      };

      firstDecadeBtn.onclick = (e) =>
        handleUpdatedElements(e, firstDecadeDataset, clickedClass);

      secondDecadeBtn.onclick = (e) =>
        handleUpdatedElements(e, secondDecadeDataset, clickedClass);

      update(firstDecadeDataset);
      resetEvents(clickedClass);
      handleEvents();
    };

    const getCalculatedScalesAndAxes = () => {
      const { barParams, axesParams } = graphProperties;
      const { translate } = graphActions;
      const { barPadding } = barParams;
      const { axesColor } = axesParams;

      const xScale = d3
        .scaleBand()
        .range([0, calculatedGraphWidth])
        .padding(barPadding);
      const xAxis = xAxisGroup
        .attr("transform", translate(0, calculatedGraphHeight))
        .style("color", axesColor);

      const yScale = d3.scaleLinear().range([calculatedGraphHeight, 0]);
      const yAxis = yAxisGroup.style("color", axesColor);

      const getGridlines = () => d3.axisLeft(yScale).ticks(5);

      return {
        xScale,
        xAxis,
        yScale,
        yAxis,
        getGridlines,
      };
    };

    const {
      xScale,
      xAxis,
      yScale,
      yAxis,
      getGridlines,
    } = getCalculatedScalesAndAxes();

    const renderView = (barCharDataset) => {
      const {
        colors,
        barParams,
        labelParams,
        axesParams,
        durationTime,
        cursorPointer,
        margin,
      } = graphProperties;
      const { rotate } = graphActions;
      const { yProperty } = dataProperties;
      const { getMaximumElement } = dataActions;
      const { barColor, labelColor, gridLinesColor } = colors;
      const { barYPositon } = barParams;
      const {
        fontSize,
        fontWeight,
        labelClass,
        textAnchorPosition,
        labelXPosition,
        labelYPosition,
        hidden,
      } = labelParams;
      const {
        axesFontSize,
        axesFontWeight,
        axesTextAnchor,
        axesTestRotate,
      } = axesParams;

      xScale.domain(barCharDataset.map((d) => d.x));
      yScale.domain([
        0,
        Math.ceil(getMaximumElement(barCharDataset, yProperty) / 100) * 100,
      ]);

      gridLinesGroup
        .attr("color", gridLinesColor)
        .style("stroke-dasharray", "3,3")
        .call(getGridlines().tickSize(-calculatedGraphWidth).tickFormat(""));

      xAxis.transition().duration(durationTime).call(d3.axisBottom(xScale));
      xAxis
        .selectAll("text")
        .attr("transform", rotate(axesTestRotate))
        .attr("text-anchor", axesTextAnchor)
        .style("font-size", axesFontSize)
        .style("font-weight", axesFontWeight);

      yAxis
        .transition()
        .duration(durationTime)
        .call(d3.axisLeft(yScale).ticks(5));
      yAxis.selectAll("text").style("font-size", axesFontSize);

      const bars = barGroup.selectAll("rect").data(barCharDataset, (d) => d.id);

      const labels = labelGroup
        .selectAll("text")
        .data(barCharDataset, (d) => d.id);

      bars
        .enter()
        .append("rect")
        .attr("x", (d) => xScale(d.x))
        .attr("y", calculatedGraphHeight)
        .attr("height", 0)
        .attr("width", xScale.bandwidth())
        .attr("fill", barColor)
        .attr("cursor", cursorPointer)
        .merge(bars)
        .transition()
        .duration(durationTime)
        .attr("y", (d) => yScale(d.y))
        .attr("height", (d) => barYPositon(calculatedGraphHeight, yScale, d.y));

      labels
        .enter()
        .append("text")
        .attr("class", labelClass.substr(1))
        .text((d) => d.text)
        .attr("x", (d) => labelXPosition(xScale, d.x))
        .attr("y", (d) => labelYPosition(yScale, d.y, margin))
        .attr("text-anchor", textAnchorPosition)
        .attr("font-size", fontSize(xScale))
        .attr("font-weight", fontWeight)
        .attr("fill", labelColor)
        .attr("opacity", hidden);

      bars.exit().remove();

      labels.exit().remove();
    };

    const handleEvents = () => {
      const {
        labelParams,
        tooltipParams,
        durationTime,
        margin,
        clickedClass,
        clickedBarClass,
      } = graphProperties;
      const { checkIfTrue } = dataActions;
      const { labelClass, visible, hidden } = labelParams;
      const { tooltipYPosition } = tooltipParams;
      const { buttons, containers } = DOMElements;
      const { labelBtn, clearBtn } = buttons;
      const { barInfo } = containers;

      const getDisplayedLabels = () => {
        d3.selectAll(labelClass)
          .transition()
          .duration(durationTime)
          .style(
            "opacity",
            checkIfTrue(!graphProperties.clickedLabel, visible, hidden)
          );
      };

      const getTooltipContent = (d) => {
        let content = `<div>${d.tooltipInfo.year}</div>`;
        content += `<div>${d.tooltipInfo.abv} %</div>`;
        content += `<div>${d.tooltipInfo.ibu} IBU</div>`;
        return content;
      };

      const getBarDataContent = (d) => {
        barInfo.innerHTML = d.tooltipInfo.hopsInfo
          .map(
            (data) =>
              `<div class="hopsDisplayedInfo"><span class="hopsName">${data.name}</span>: <span class="hopsValue">${data.value}</span> - ${data.attribute}</div>`
          )
          .join("");
      };

      const handleLabels = (e) => {
        getDisplayedLabels();
        e.target.classList.toggle(clickedClass);
        graphProperties.clickedLabel = !graphProperties.clickedLabel;
      };

      const handleBarsData = (e, item, data) => {
        item.forEach((bar) => bar.classList.remove(clickedBarClass));
        e.target.classList.add(clickedBarClass);
        getBarDataContent(data);
        clearBtn.classList.remove(clickedClass);
      };

      const getBarsDataCleared = (e) => {
        if (!barInfo.innerHTML) {
          return;
        }

        e.target.classList.add(clickedClass);
        barInfo.innerHTML = ``;
        barGroup.selectAll("rect").each((d, i, n) => {
          n[i].classList.remove(clickedBarClass);
        });
      };

      const tip = d3
        .tip()
        .attr("class", "tip")
        .offset([-tooltipYPosition(xScale, margin * 1.5), 0])
        .html((d) => getTooltipContent(d));

      labelBtn.onclick = (e) => handleLabels(e);

      barGroup
        .selectAll("rect")
        .each((d, i, n) => {
          n[i].addEventListener("click", (e) => {
            if (n[i].classList.contains(clickedBarClass)) {
              return;
            }
            handleBarsData(e, n, d);
          });
        })
        .call(tip)
        .on("mouseover", (d, i, n) => tip.show(d, n[i]))
        .on("mouseout", () => tip.hide());

      clearBtn.addEventListener("click", (e) => getBarsDataCleared(e));
    };

    const resetEvents = (classType) => {
      const { buttons, containers } = DOMElements;
      const { dataBtns, labelBtn, clearBtn } = buttons;
      const { barInfo } = containers;

      barInfo.textContent = "";
      dataBtns.forEach((btn) => btn.classList.remove(classType));
      labelBtn.classList.remove(classType);
      graphProperties.clickedLabel = false;
      clearBtn.classList.remove(classType);
    };

    const update = (barCharDataset) => {
      renderView(barCharDataset);
    };

    const getData = async (optionValue) => {
      try {
        await d3.json(DATA(optionValue)).then((data) => {
          getProperPeriod(data);
        });
      } catch (err) {
        return console.log(`It's definitively not good for you: ${err}`);
      }
    };

    return { getData };
  })();
  document.querySelector(".selectedSet").addEventListener("change", (e) => {
    barChart.getData(e.target.value);
  });
})();

},{"./DOMElements":1,"./dataActions":3,"./dataProperties":4,"./graphActions":5,"./graphProperties":6,"uniq":7}],3:[function(require,module,exports){
module.exports.dataActions = {
  getEarlierPeriod: (data, property, sliceValue, range) =>
    !data || !property || !sliceValue || !range
      ? []
      : data.filter((item) =>
          item[property].length > 4
            ? Number(item[property].slice(sliceValue)) <= range
            : Number(item[property]) <= range
        ),

  getLaterPeriod: (data, property, sliceValue, range) =>
    !data || !property || !sliceValue || !range
      ? []
      : data.filter((item) =>
          item[property].length > 4
            ? Number(item[property].slice(sliceValue)) > range
            : Number(item[property]) > range
        ),

  getHopsValues: (item, firstProp, secondProp, thirdProp, fourthProp) =>
    !firstProp || !secondProp || !thirdProp || !fourthProp
      ? []
      : item[firstProp][secondProp].map((item) => item[thirdProp][fourthProp]),

  getHopsSum: (arr) =>
    !arr.length
      ? 0
      : arr.reduce((prevValue, currValue) => prevValue + currValue),

  checkIfTrue: (condition, firstItem, secondItem) =>
    condition ? firstItem : secondItem,

  getHopsInfo: (dd, checkFn, emptyValue, nameProp, valueProp, attrProp) =>
    !dd || !checkFn
      ? []
      : {
          name: `${checkFn(dd[nameProp], dd[nameProp], emptyValue)}`,
          value: `${checkFn(dd[valueProp], dd[valueProp], emptyValue)}g`,
          attribute: `${checkFn(dd[attrProp], dd[attrProp], emptyValue)}`,
        },

  getMaximumElement: (arr, property) =>
    !arr || !arr.length
      ? 0
      : Math.max(
          ...arr.map((item) =>
            !property || item[property] === undefined ? 0 : item[property]
          )
        ),
};

},{}],4:[function(require,module,exports){
module.exports.dataProperties = {
  periodRange: 2010,
  cutMonth: 3,
  cutName: 25,
  hopsProperty: "hops",
  ingredientsProperty: "ingredients",
  amountProperty: "amount",
  valueProperty: "value",
  firstBrewedProperty: "first_brewed",
  yProperty: "y",
  noData: "no data",
};

},{}],5:[function(require,module,exports){
module.exports.graphActions = {
  getContainer: (field) => document.getElementById(field),

  translate: (firstMarginValue, secondMarginValue) =>
    typeof firstMarginValue !== "number" ||
    typeof secondMarginValue !== "number"
      ? `translate(0, 0)`
      : `translate(${firstMarginValue}, ${secondMarginValue})`,

  rotate: (num) => (typeof num !== "number" ? `rotate(0)` : `rotate(${num})`),
};

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict"

function unique_pred(list, compare) {
  var ptr = 1
    , len = list.length
    , a=list[0], b=list[0]
  for(var i=1; i<len; ++i) {
    b = a
    a = list[i]
    if(compare(a, b)) {
      if(i === ptr) {
        ptr++
        continue
      }
      list[ptr++] = a
    }
  }
  list.length = ptr
  return list
}

function unique_eq(list) {
  var ptr = 1
    , len = list.length
    , a=list[0], b = list[0]
  for(var i=1; i<len; ++i, b=a) {
    b = a
    a = list[i]
    if(a !== b) {
      if(i === ptr) {
        ptr++
        continue
      }
      list[ptr++] = a
    }
  }
  list.length = ptr
  return list
}

function unique(list, compare, sorted) {
  if(list.length === 0) {
    return list
  }
  if(compare) {
    if(!sorted) {
      list.sort(compare)
    }
    return unique_pred(list, compare)
  }
  if(!sorted) {
    list.sort()
  }
  return unique_eq(list)
}

module.exports = unique

},{}]},{},[2]);
