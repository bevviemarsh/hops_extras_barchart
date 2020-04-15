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
