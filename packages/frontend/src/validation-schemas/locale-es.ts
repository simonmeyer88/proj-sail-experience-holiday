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
  if (typeOf === "function") return `[Función ${val.name || "anónima"}]`;
  if (typeOf === "symbol")
    return symbolToString.call(val).replace(SYMBOL_REGEXP, "Símbolo($1)");

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
  default: "Este campo no es válido.",
  required: "Este campo es obligatorio.",
  oneOf: "Este campo debe ser uno de los siguientes valores: ${values}",
  notOneOf: "Este campo no debe ser uno de los siguientes valores: ${values}",
  notType: ({ path, type, value, originalValue }) => {
    const isCast = originalValue !== undefined && originalValue !== value;
    let msg =
      `${path} debe ser de tipo \`${type}\`, ` +
      `pero el valor final fue: \`${printValue(value, true)}\`` +
      (isCast
        ? ` (Derivado del valor \`${printValue(originalValue, true)}\`).`
        : ".");

    if (value === null) {
      msg +=
        `\n Si "null" es intencionalmente un valor vacío, asegúrese de marcar el esquema como` +
        " `.nullable()`";
    }

    return msg;
  },
};

export const string: LocaleObject["string"] = {
  length: "Este campo debe tener exactamente ${length} caracteres.",
  min: "Este campo debe tener al menos ${min} caracteres.",
  max: "Este campo debe tener como máximo ${max} caracteres.",
  matches: 'Este campo debe coincidir con el siguiente patrón: "${regex}".',
  email: "Formato de correo electrónico no válido.",
  url: "Formato de URL no válido.",
  trim: "Este campo debe ser una cadena recortada.",
  lowercase: "Este campo debe estar en minúsculas.",
  uppercase: "Este campo debe estar en mayúsculas.",
};

export const number: LocaleObject["number"] = {
  min: "Este campo debe ser mayor o igual a ${min}.",
  max: "Este campo debe ser menor o igual a ${max}.",
  lessThan: "Este campo debe ser menor que ${less}.",
  moreThan: "Este campo debe ser mayor que ${more}.",
  positive: "Este campo debe ser un número positivo.",
  negative: "Este campo debe ser un número negativo.",
  integer: "Este campo debe ser un número entero.",
};

export const date: LocaleObject["date"] = {
  min: "Este campo debe ser posterior a ${min}.",
  max: "Este campo debe ser anterior a ${max}.",
};

export const boolean: LocaleObject["boolean"] = {};

export const object: LocaleObject["object"] = {
  noUnknown: "Este campo contiene claves no especificadas en el objeto.",
};

export const array: LocaleObject["array"] = {
  min: (context) => {
    return context.min === 1
      ? `Este campo debe tener al menos 1 elemento.`
      : `Este campo debe tener al menos ${context.min} elementos.`;
  },
  max: (context) => {
    return context.max === 1
      ? `Este campo debe tener como máximo 1 elemento.`
      : `Este campo debe tener como máximo ${context.max} elementos.`;
  },
};
