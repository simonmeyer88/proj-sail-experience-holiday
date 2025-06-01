import "./phone-util";
import * as Yup from "yup";
import { defaultString, phoneNumber } from "./common";
export const editAdminProfileStudentSchema = Yup.object().shape({
  firstName: defaultString,
  lastName: defaultString,
  phoneNumber: phoneNumber,
  address: defaultString,
  birthDate: Yup.string().required(),
  zipCode: defaultString,
  city: defaultString,
  idNumber: defaultString,
  idIssueDate: Yup.string().required(),
  courseId: Yup.string(),
  isInClub: Yup.boolean().optional(),
});

export const editAdminProfileManagerSchema = Yup.object().shape({
  firstName: defaultString,
  lastName: defaultString,
  phoneNumber: phoneNumber,
});

export const editMeProfileStudentSchema = Yup.object().shape({
  firstName: defaultString,
  lastName: defaultString,
  phoneNumber: phoneNumber,
  address: defaultString,
  birthDate: Yup.string().required(),
  zipCode: defaultString,
  city: defaultString,
  idNumber: defaultString,
  idIssueDate: Yup.string().required(),
});

export const editMeProfileManagerSchema = Yup.object().shape({
  firstName: defaultString,
  lastName: Yup.string().required(),
  phoneNumber: phoneNumber,
});
