const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("works: 1 item", function () {
    expect(() => sqlForPartialUpdate({}, {})).toThrow(BadRequestError);

    const result = sqlForPartialUpdate({ f1: "v1" }, { f1: "f1" });
    expect(result).toEqual({
      setCols: "\"f1\"=$1",
      values: ["v1"],
    });
  });

  test("works: multiple items", function () {
    const result = sqlForPartialUpdate(
      { firstName: 'Aliya', age: 32 },
      { firstName: "first_name" }
    );
    expect(result).toEqual({
      setCols: "\"first_name\"=$1, \"age\"=$2",
      values: ['Aliya', 32],
    });
  });
});
