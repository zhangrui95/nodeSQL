const fs = require("fs");

const json_string = fs.readFileSync("test/pubdata.json", "utf-8")
const data = JSON.parse(json_string)

let schema = {
  type: "array",
  minItems: 1,
  maxItems: 100,
  items: [{
    type: "object",
    required: ["read", "read_m", "nodeid", "systemid", "time", "id", "xxtb", "xxbt", "xxbj", "xxmc", "xxzt", "xxtp", "xxxs_ary", "btn_ary"],
    properties: {
      read: {
        type: "integer",
        const: 0
      },
      read_m: {
        type: "integer",
        const: 0
      },
      nodeid: {
        type: "string",
        minLength: 6
      },
      systemid: {
        type: "string",
        minLength: 6,
        maxLength: 6
      },
      time: {
        type: "string",
        pattern: "^[1-9]\\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\\s+(20|21|22|23|[0-1]\\d):[0-5]\\d:[0-5]\\d$"
      },
      xxtb: {
        type: "object",
        required: ["type", "isvisible", "msg", "act", "comment"]
      },
      xxbt: {
        type: "object",
        required: ["type", "isvisible", "msg", "act", "comment"]
      },
      xxbj: {
        type: "object",
        required: ["type", "isvisible", "msg", "act", "comment"]
      },
      xxmc: {
        type: "object",
        required: ["type", "isvisible", "msg", "act", "comment"]
      },
      xxzt: {
        type: "object",
        required: ["type", "isvisible", "msg", "act", "comment"]
      },
      xxtp: {
        type: "object",
        required: ["type", "isvisible", "msg", "act", "comment"]
      },
      xxxs_ary: {
        type: "array"
      },
      btn_ary: {
        type: "array"
      }
    }
  }]
};

var Ajv = require("ajv");
var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
var validate = ajv.compile(schema);
var valid = validate(data);
if (!valid) {
  console.log(validate.errors);
}

