import {
  PASSWORD_REGEX,
  STR_MAX_LENGTH,
  STR_MIN_LENGTH,
} from "@aula-anclademia/common/validation-constants";
import * as Yup from "yup";
import "./phone-util";
import i18n from "@/core/plugins/i18n";

export const defaultString = Yup.string()
  .required()
  .min(STR_MIN_LENGTH)
  .max(STR_MAX_LENGTH);

export const email = Yup.string().email().required();

export const password = Yup.string()
  .required()
  .matches(PASSWORD_REGEX, i18n.global.t("userForm.passwordMessage"));

export const emailVerificationCode = Yup.string().required();
export const phoneNumber = Yup.string()
  .required()
  .phone(undefined, undefined, i18n.global.t("userForm.invalidPhoneNumber"));
