(function () {
  const barChart = (function () {
    const unique = require("uniq");

    const DATA = "https://api.punkapi.com/v2/beers?page=1";

    const graphProperties = {
      colors: {
        barColor: "#13b937",
        clickedBarColor: "#019221",
        labelColor: "black",

        graphLinesColor: "black",
        tooltipBcgColor: "black",
        tooltipInfoColor: "black",
      },

      barParams: {
        barPadding: 0.2,
        barYPositon: (height, scaleFn, value) => height - scaleFn(value),
      },

      labelParams: {
        fontSize: (scaleFn) =>
          scaleFn.bandwidth() >= 40
            ? scaleFn.bandwidth() / 5
            : scaleFn.bandwidth() / 3,
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
      graphMargin: { top: 50, left: 20, right: 120, bottom: 150 },

      durationTime: 400,

      clicked: true,

      translate: (firstMarginValue, secondMarginValue) =>
        typeof firstMarginValue !== "number" ||
        typeof secondMarginValue !== "number"
          ? `translate(0, 0)`
          : `translate(${firstMarginValue}, ${secondMarginValue})`,

      rotate: (num) =>
        typeof num !== "number" ? `rotate(0)` : `rotate(${num})`,
    };

    const graphActions = {
      getContainer: (field) => document.getElementById(field),
    };

    const dataProperties = {
      periodRange: 2011,
      cutMonth: 3,
      hopsProperty: "hops",
      ingredientsProperty: "ingredients",
      amountProperty: "amount",
      valueProperty: "value",
      firstBrewedProperty: "first_brewed",
      yProperty: "y",
      noData: "no data",
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

      checkIfTrue: (condition, firstItem, secondItem) =>
        condition ? firstItem : secondItem,

      getTooltipInfo: (dd, checkFn, emptyValue) =>
        !dd || !checkFn
          ? []
          : `${checkFn(dd.name, dd.name, emptyValue)}: ${checkFn(
              dd.value,
              dd.value,
              emptyValue
            )}g - ${checkFn(dd.attribute, dd.attribute, emptyValue)}`,

      getMaximumElement: (arr, property) =>
        !arr || !arr.length
          ? 0
          : Math.max(
              ...arr.map((item) =>
                !property || item[property] === undefined ? 0 : item[property]
              )
            ),
    };

    const getCalculatedSVGAndGraphParams = (chartField) => {
      const { margin, graphMargin, translate } = graphProperties;
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

      const barGroup = mainChart.append("g");
      const labelGroup = mainChart.append("g");

      return { mainSvg, barGroup, labelGroup };
    };

    const { mainSvg, barGroup, labelGroup } = getCreatedSVGAndGraph(
      graphProperties.graphId
    );

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
      console.log(dataBeforeperiodRange);
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
      const { noData } = dataProperties;
      const { checkIfTrue, getTooltipInfo } = dataActions;

      const getCalculatedBarChartData = (data) =>
        data.map((d) => ({
          id: d.id,
          x: checkIfTrue(
            d.name.length > 25,
            `${d.name.substr(0, 25)}...`,
            d.name
          ),
          y: d.amount,
          text: d.amount.toFixed(1),
          tooltipInfo: {
            year: checkIfTrue(d.year, d.year, noData),
            abv: checkIfTrue(d.abv, d.abv, noData),
            ibu: checkIfTrue(d.ibu, d.ibu, noData),
            hopsInfo: d.hops.map((dd) =>
              getTooltipInfo(dd, checkIfTrue, noData)
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
      document.querySelector(".earlierBtn").addEventListener("click", () => {
        update(firstDecadeBarChartData);
        // graphProperties.clicked = !graphProperties.clicked;
      });
      document.querySelector(".laterBtn").addEventListener("click", () => {
        update(secondDecadeBarChartData);
        // graphProperties.clicked = graphProperties.clicked;
      });

      return update(firstDecadeBarChartData);
    };

    const getCalculatedScalesAndAxes = () => {
      const { barParams, axesParams, translate } = graphProperties;
      const { barPadding } = barParams;
      const { axesColor } = axesParams;

      const xScale = d3
        .scaleBand()
        .range([0, calculatedGraphWidth])
        .padding(barPadding);
      const xAxis = mainSvg
        .append("g")
        .attr("transform", translate(0, calculatedGraphHeight))
        .style("color", axesColor);

      const yScale = d3.scaleLinear().range([calculatedGraphHeight, 0]);
      const yAxis = mainSvg.append("g").style("color", axesColor);

      return {
        xScale,
        xAxis,
        yScale,
        yAxis,
      };
    };

    const { xScale, xAxis, yScale, yAxis } = getCalculatedScalesAndAxes();

    const renderView = (barCharDataset) => {
      const {
        colors,
        barParams,
        labelParams,
        axesParams,
        durationTime,
        cursorPointer,
        rotate,
        margin,
      } = graphProperties;
      const { yProperty } = dataProperties;
      const { getMaximumElement } = dataActions;
      const { barColor } = colors;
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

      console.log(barCharDataset);

      xScale.domain(barCharDataset.map((d) => d.x));
      xAxis.transition().duration(durationTime).call(d3.axisBottom(xScale));
      xAxis
        .selectAll("text")
        .attr("transform", rotate(axesTestRotate))
        .attr("text-anchor", axesTextAnchor)
        .style("font-size", axesFontSize)
        .style("font-weight", axesFontWeight);

      yScale.domain([0, getMaximumElement(barCharDataset, yProperty)]);
      yAxis.transition().duration(durationTime).call(d3.axisLeft(yScale));
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
        .attr("opacity", hidden);

      bars.exit().remove();

      labels.exit().remove();
    };

    const handleEvents = () => {
      const { colors, labelParams, durationTime } = graphProperties;
      const { checkIfTrue } = dataActions;
      const { barColor, clickedBarColor } = colors;
      const { labelClass, visible, hidden } = labelParams;

      const handleLabels = (d, i, n) => {
        d3.selectAll(n)
          .transition()
          .duration(durationTime)
          .attr(
            "fill",
            checkIfTrue(graphProperties.clicked, clickedBarColor, barColor)
          );

        d3.selectAll(labelClass)
          .transition()
          .duration(durationTime)
          .style(
            "opacity",
            checkIfTrue(graphProperties.clicked, visible, hidden)
          );
      };

      barGroup.selectAll("rect").on("click", (d, i, n) => {
        handleLabels(d, i, n);
        graphProperties.clicked = !graphProperties.clicked;
        console.log(graphProperties.clicked);
      });
    };

    const update = (barCharDataset) => {
      renderView(barCharDataset);
      handleEvents();
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
