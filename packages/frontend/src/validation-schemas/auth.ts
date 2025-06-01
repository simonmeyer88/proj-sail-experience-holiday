import "./phone-util";
import * as Yup from "yup";

import {
  defaultString,
  email,
  emailVerificationCode,
  password,
  phoneNumber,
} from "./common";
import i18n from "@/core/plugins/i18n";

export const registerSchema = Yup.object().shape({
  email,
  password,
  passwordConfirmation: password.oneOf(
    [Yup.ref("password")],
    i18n.global.t("userForm.passwordsMustMatch")
  ),
  emailVerificationCode,
});

export const requestEmailVerificationCodeSchema = Yup.object().shape({
  email,
});

export const loginSchema = Yup.object().shape({
  email,
  password: Yup.string().required(),
});

export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required(),
  newPassword: password,
  confirmPassword: password.oneOf(
    [Yup.ref("newPassword")],
    i18n.global.t("userForm.passwordsMustMatch")
  ),
});

export const onboardStudentSchema = Yup.object().shape({
  firstName: defaultString,
  lastName: defaultString,
  phoneNumber: phoneNumber,
  address: defaultString,
  birthDate: Yup.string().required(),
  zipCode: defaultString,
  city: defaultString,
  idNumber: defaultString,
  idIssueDate: Yup.string().required(),
  courseId: Yup.string().optional(),
  joinClub: Yup.boolean().optional(),
});

export const onboardTeacherSchema = Yup.object().shape({
  firstName: defaultString,
  lastName: defaultString,
  phoneNumber: phoneNumber,
});

export const changeEmailSchema = Yup.object().shape({
  newEmail: email,
  password: Yup.string().required(),
  emailVerificationCode: emailVerificationCode,
});

export const requestPasswordTokenSchema = Yup.object().shape({
  email: email,
});

export const changeForgottenPasswordSchema = Yup.object().shape({
  newPassword: password,
  confirmNewPassword: password.oneOf(
    [Yup.ref("newPassword")],
    i18n.global.t("userForm.passwordsMustMatch")
  ),
  email: email,
  token: Yup.string().required(),
});
