import i18n from "./plugins/i18n";
import * as Yup from "yup";
import * as es from "@/validation-schemas/locale-es";
import * as en from "@/validation-schemas/locale-en";
export const initYupLocale = () => {
  const locale = i18n.global.locale.value;
  Yup.setLocale(locale === "es" ? es : en);
};
