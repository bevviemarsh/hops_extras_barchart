const { dataActions } = require("../scripts/dataActions");

test("get an array of values", () => {
  const exampleDataStructure = [
    {
      id: 1,
      name: "Example beer",
      first_brewed: "01/2007",
      ingredients: { hops: [{ amount: { value: 25, unit: "grams" } }] },
    },
  ];
  const item = exampleDataStructure[0];
  const firstProp = "ingredients";
  const secondProp = "hops";
  const thirdProp = "amount";
  const fourthProp = "value";

  expect(
    dataActions.getHopsValues(
      item,
      firstProp,
      secondProp,
      thirdProp,
      fourthProp
    )
  ).toContain(25);
});

test("no property case", () => {
  const exampleDataStructure = [
    { ingredients: { malts: [{ amount: { value: 2.5, unit: "kilograms" } }] } },
  ];
  const item = exampleDataStructure[0];
  const firstProp = "ingredients";
  const secondProp = "";
  const thirdProp = "amount";
  const fourthProp = "value";

  expect(
    dataActions.getHopsValues(
      item,
      firstProp,
      secondProp,
      thirdProp,
      fourthProp
    )
  ).toStrictEqual([]);
});

test("sum all of numbers in array", () => {
  const exampleNumbersArray = [1, 2, 3, 4];
  expect(dataActions.getHopsSum(exampleNumbersArray)).toBe(10);
});

test("empty array case", () => {
  const exampleEmptyArray = [];
  expect(dataActions.getHopsSum(exampleEmptyArray)).toBe(0);
});

test("filter data by periods", () => {
  const exampleDataStructure = [
    {
      id: 1,
      name: "First beer",
      first_brewed: "01/2007",
      ingredients: { hops: [{ amount: { value: 25, unit: "grams" } }] },
    },
    {
      id: 2,
      name: "Second beer",
      first_brewed: "01/2012",
      ingredients: { hops: [{ amount: { value: 50, unit: "grams" } }] },
    },
  ];

  const periodRange = 2010;
  const firstProperty = "first_brewed";
  const cutMonth = 3;

  expect(
    dataActions.getEarlierPeriod(
      exampleDataStructure,
      firstProperty,
      cutMonth,
      periodRange
    )
  ).toContain(exampleDataStructure[0]);

  expect(
    dataActions.getLaterPeriod(
      exampleDataStructure,
      firstProperty,
      cutMonth,
      periodRange
    )
  ).toContain(exampleDataStructure[1]);
});

test("filter with falsy values", () => {
  const exampleDataStructure = [];

  const periodRange = 2010;
  const firstProperty = "first_brewed";
  const cutMonth = 3;

  expect(
    dataActions.getEarlierPeriod(
      exampleDataStructure,
      firstProperty,
      cutMonth,
      periodRange
    )
  ).toStrictEqual([]);

  expect(
    dataActions.getLaterPeriod(
      exampleDataStructure,
      firstProperty,
      cutMonth,
      periodRange
    )
  ).toStrictEqual([]);
});

test("check boolean of element", () => {
  const exampleObject = { name: "Random beer" };
  const exampleNoData = "no data";
  const exampleObjectWithMissingData = { name: "" };

  expect(
    dataActions.checkIfTrue(
      exampleObject.name,
      exampleObject.name,
      exampleNoData
    )
  ).toEqual("Random beer");

  expect(
    dataActions.checkIfTrue(
      exampleObjectWithMissingData.name,
      exampleObject.name,
      exampleNoData
    )
  ).toBe("no data");
});

test("get hops info", () => {
  const exampleData = [{ name: "Random hop", value: 5, attribute: "aroma" }];
  const exampleNoData = "no data";

  expect(
    dataActions.getHopsInfo(
      exampleData[0],
      dataActions.checkIfTrue,
      exampleNoData,
      "name",
      "value",
      "attribute"
    )
  ).toEqual({ name: "Random hop", value: "5g", attribute: "aroma" });
});

test("get hops with missing data", () => {
  const exampleEmptyArray = [];
  const exampleNoData = "no data";

  expect(
    dataActions.getHopsInfo(
      exampleEmptyArray[0],
      dataActions.checkIfTrue,
      exampleNoData
    )
  ).toStrictEqual([]);
});

test("get max element from array", () => {
  const exampleArray = [
    { name: "first random beer", value: 10 },
    { name: "second random beer", value: 15 },
    { name: "third random beer", value: 5 },
  ];
  const exampleProperty = "value";

  expect(dataActions.getMaximumElement(exampleArray, exampleProperty)).toBe(15);
});

test("get max element from empty array case or no property case", () => {
  const exampleArray = [
    { name: "first random beer", value: 10 },
    { name: "second random beer", value: 15 },
    { name: "third random beer", value: 5 },
  ];
  const exampleEmptyArray = [];
  const exampleProperty = "value";
  const exampleNoExistanceProp = "beer";
  const exampleNoProp = "";

  expect(
    dataActions.getMaximumElement(exampleEmptyArray, exampleProperty)
  ).toBe(0);

  expect(dataActions.getMaximumElement(exampleArray, exampleNoProp)).toBe(0);

  expect(dataActions.getMaximumElement(exampleEmptyArray, exampleNoProp)).toBe(
    0
  );

  expect(
    dataActions.getMaximumElement(exampleArray, exampleNoExistanceProp)
  ).toBe(0);
});
