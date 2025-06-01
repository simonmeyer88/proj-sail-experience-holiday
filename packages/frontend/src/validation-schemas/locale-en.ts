import { LocaleObject } from "yup";

const toString = Object.prototype.toString;
const errorToString = Error.prototype.toString;
const regExpToString = RegExp.prototype.toString;
const symbolToString =
  typeof Symbol !== "undefined" ? Symbol.prototype.toString : () => "";

const SYMBOL_REGEXP = /^Symbol\((.*)\)(.*)$/;

function printNumber(val: number) {
  if (isNaN(val)) return "NaN";
  const isNegativeZero = val === 0 && 1 / val < 0;
  return isNegativeZero ? "-0" : "" + val;
}

function printSimpleValue(val: any, quoteStrings = false) {
  if (val === null || val === true || val === false) return "" + val;

  const typeOf = typeof val;
  if (typeOf === "number") return printNumber(val);
  if (typeOf === "string") return quoteStrings ? `"${val}"` : val;
  if (typeOf === "function") return `[Function ${val.name || "anonymous"}]`;
  if (typeOf === "symbol")
    return symbolToString.call(val).replace(SYMBOL_REGEXP, "Symbol($1)");

  const tag = toString.call(val).slice(8, -1);
  if (tag === "Date")
    return isNaN(val.getTime()) ? "" + val : val.toISOString();
  if (tag === "Error" || val instanceof Error)
    return `[Error ${errorToString.call(val)}]`;
  if (tag === "RegExp") return regExpToString.call(val);

  return null;
}

export default function printValue(value: string, quoteStrings: boolean) {
  const result = printSimpleValue(value, quoteStrings);
  if (result !== null) return result;

  return JSON.stringify(
    value,
    (_, val) => {
      const result = printSimpleValue(val, quoteStrings);
      if (result !== null) return result;
      return val;
    },
    2
  );
}

export const mixed: LocaleObject["mixed"] = {
  default: "This field is not valid.",
  required: "This field is required.",
  oneOf: "This field must be one of the following values: ${values}",
  notOneOf: "This field must not be one of the following values: ${values}",
  notType: ({ path, type, value, originalValue }) => {
    const isCast = originalValue !== undefined && originalValue !== value;
    let msg =
      `${path} must be of type \`${type}\`, ` +
      `but the final value was: \`${printValue(value, true)}\`` +
      (isCast
        ? ` (Derived from the value \`${printValue(originalValue, true)}\`).`
        : ".");

    if (value === null) {
      msg +=
        `\n If "null" is intentionally an empty value, make sure to mark the schema as` +
        " `.nullable()`";
    }

    return msg;
  },
};

export const string: LocaleObject["string"] = {
  length: "This field must have exactly ${length} characters.",
  min: "This field must have at least ${min} characters.",
  max: "This field must have at most ${max} characters.",
  matches: 'This field must match the following pattern: "${regex}".',
  email: "Invalid email format.",
  url: "Invalid URL format.",
  trim: "This field must be a trimmed string.",
  lowercase: "This field must be in lowercase.",
  uppercase: "This field must be in uppercase.",
};

export const number: LocaleObject["number"] = {
  min: "This field must be greater than or equal to ${min}.",
  max: "This field must be less than or equal to ${max}.",
  lessThan: "This field must be less than ${less}.",
  moreThan: "This field must be more than ${more}.",
  positive: "This field must be a positive number.",
  negative: "This field must be a negative number.",
  integer: "This field must be an integer.",
};

export const date: LocaleObject["date"] = {
  min: "This field must be after ${min}.",
  max: "This field must be before ${max}.",
};

export const boolean: LocaleObject["boolean"] = {};

export const object: LocaleObject["object"] = {
  noUnknown: "This field contains unspecified keys in the object.",
};

export const array: LocaleObject["array"] = {
  min: (context) => {
    return context.min === 1
      ? `This field must have at least 1 element.`
      : `This field must have at least ${context.min} elements.`;
  },
  max: (context) => {
    return context.max === 1
      ? `This field must have at most 1 element.`
      : `This field must have at most ${context.max} elements.`;
  },
};
