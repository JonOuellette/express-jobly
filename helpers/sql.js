const { BadRequestError } = require("../expressError");

/**
*  Assists in updating SQL update statements dynamically by simplifying and automate the creation of 
* SQL UPDATE statements in situations where only certain fields need to be updated.

* @param dataToUpdate {Object} {field1: newValue, field2: newValue, ...}
* @param jsToSql {Object} maps js-style data fields to database column names,
*   like { firstName: "first_name", age: "age" }
*
* @returns {Object} {sqlSetCols, dataToUpdate}
*
* @example {firstName: 'Aliya', age: 32} =>
*   { setCols: '"first_name"=$1, "age"=$2',
*     values: ['Aliya', 32] }
*/


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
