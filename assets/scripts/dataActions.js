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
