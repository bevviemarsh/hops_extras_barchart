(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function () {
  const barChart = (function () {
    const unique = require("uniq");

    const DATA = "https://api.punkapi.com/v2/beers";

    const graphProperties = {
      colors: {
        barColor: "black",
        clickedBarColor: "black",
        labelColor: "black",

        graphLinesColor: "black",
        tooltipBcgColor: "black",
        tooltipInfoColor: "black",
      },

      labelParams: {
        fontFamily: "Muli",
        fontWeight: "normal",
        fontSize: "13px",
        labelColor: "#1af48b",
        opacityValue: "0",
        textAnchorPosition: "start",
        letterSpacing: "1",
      },

      axesParams: {
        axisColor: "black",
        axesFontSize: "12px",
        axesLetterSpacing: "0.5",
        tickSizeValue: "10",
      },

      strokeWidth: 1,

      visible: "1",
      hidden: "0",
      cursorPointer: "pointer",

      graphId: "barChart",
      labelClass: ".barChart",

      margin: 10,
      graphMargin: { top: 20, left: 20, right: 100, bottom: 100 },

      translate: (firstMarginValue, secondMarginValue) =>
        `translate(${firstMarginValue}, ${secondMarginValue})`,

      durationTime: 200,
    };

    const graphActions = {
      getContainer: (field) => document.getElementById(field),
    };

    const dataProperties = {
      periodRange: 2010,
      cutMonth: 3,
      hopsProperty: "hops",
      ingredientsProperty: "ingredients",
      amountProperty: "amount",
      valueProperty: "value",
      firstBrewedProperty: "first_brewed",
    };

    const dataActions = {
      getEarlierPeriod: (data, property, sliceValue, range) =>
        !data || !property || !sliceValue || !range
          ? []
          : data.filter(
              (item) => Number(item[property].slice(sliceValue)) <= range
            ),

      getLaterPeriod: (data, property, sliceValue, range) =>
        !data || !property || !sliceValue || !range
          ? []
          : data.filter(
              (item) => Number(item[property].slice(sliceValue)) > range
            ),

      getHopsValues: (item, firstProp, secondProp, thirdProp, fourthProp) =>
        !firstProp || !secondProp || !thirdProp || !fourthProp
          ? []
          : item[firstProp][secondProp].map(
              (item) => item[thirdProp][fourthProp]
            ),

      getHopsSum: (arr) =>
        !arr.length
          ? 0
          : arr.reduce((prevValue, currValue) => prevValue + currValue),

      checkIfTrue: (item) => (!item ? "no data" : item),

      getTooltipInfo: (dd, checkFn) =>
        !dd || !checkFn
          ? []
          : `${checkFn(dd.name)}: ${checkFn(dd.value)}g - ${checkFn(
              dd.attribute
            )}`,
    };

    const getCalculatedSVGAndGraphParams = (chartField) => {
      const { margin, graphMargin, translate, graphId } = graphProperties;
      const { getContainer } = graphActions;

      const mainContainer = (chartField) => getContainer(chartField);
      const basicWidth = mainContainer(chartField).offsetWidth;
      const calculatedSvgWidth = basicWidth - margin;
      const calculatedGraphWidth =
        calculatedSvgWidth - graphMargin.left - graphMargin.right;

      const basicHeight = mainContainer(chartField).offsetHeight;
      const calculatedSvgHeight = basicHeight - margin;
      const calculatedGraphHeight =
        calculatedSvgHeight - graphMargin.top - graphMargin.bottom;

      const graphPosition = translate(graphMargin.left, graphMargin.top);

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

    const getCreatedSVGAndGraph = (chartField) => {
      const {
        mainContainer,
        basicWidth,
        calculatedSvgWidth,
        basicHeight,
        calculatedSvgHeight,
        graphPosition,
      } = getCalculatedSVGAndGraphParams(chartField);

      const svgSelection = d3.select(mainContainer(chartField)).append("svg");

      const mainSvg = svgSelection
        .attr("width", basicWidth)
        .attr("height", basicHeight)
        .append("g");

      const mainChart = mainSvg
        .attr("width", calculatedSvgWidth)
        .attr("height", calculatedSvgHeight)
        .attr("transform", graphPosition);

      return mainChart;
    };

    const getMainChart = (chartField) => getCreatedSVGAndGraph(chartField);

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
      console.log(firstDecade, secondDecade);

      const { checkIfTrue, getTooltipInfo } = dataActions;

      const getCalculatedBarChartData = (data) =>
        data.map((d) => ({
          id: d.id,
          x: d.name,
          y: d.amount,
          text: d.amount,
          tooltipInfo: {
            abv: checkIfTrue(d.abv),
            ibu: checkIfTrue(d.ibu),
            hopsInfo: d.hops.map((dd) => getTooltipInfo(dd, checkIfTrue)),
          },
        }));

      const firstDecadeBarChartData = getCalculatedBarChartData(firstDecade);
      const secondDecadeBarChartData = getCalculatedBarChartData(secondDecade);

      return getChosenDataset(
        firstDecadeBarChartData,
        secondDecadeBarChartData
      );
    };

    const getCalculatedScalesAndAxes = () => {};

    const renderView = (barCharDataset) => {
      const { graphId } = graphProperties;

      console.log(barCharDataset);

      const barChart = getMainChart(graphId);
    };

    const update = (barCharDataset) => {
      renderView(barCharDataset);
    };

    const getData = async () => {
      try {
        const data = await d3.json(DATA);
        return data;
      } catch (err) {
        return console.log(`It's definitively not good for you: ${err}`);
      }
    };

    getData().then((data) => getProperPeriod(data));

    module.exports = {
      dataActions,
      graphActions,
    };

    return { getData };
  })();
  barChart.getData();
})();

},{"uniq":2}],2:[function(require,module,exports){
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

},{}]},{},[1]);
