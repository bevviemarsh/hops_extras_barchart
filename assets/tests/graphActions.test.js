jest.mock("../__mocks__/app.js");

const { graphActions } = require("../scripts/app");

test("pass id and no id", () => {
  const testId = "bar";
  const testNoId = "";
  const exampleDOM = `<div id=${testId}></div>`;
  document.body.innerHTML = exampleDOM;

  expect(graphActions.getContainer(testId)).toEqual(
    document.getElementById(testId)
  );

  expect(graphActions.getContainer(testNoId)).toBeNull();
});

// test("input some values to translate", () => {
//   const exampleValues = { x: 15, y: 20 };

//   expect(graphActions.translate(exampleValues.x, exampleValues.y)).toEqual(
//     `translate(${exampleValues.x}, ${exampleValues.y})`
//   );
// });

// test("no number values to translate", () => {
//   const exampleValues = { x: "string", y: 20 };

//   expect(graphActions.translate(exampleValues.x, exampleValues.y)).toEqual(
//     `translate(0, 0)`
//   );
// });
