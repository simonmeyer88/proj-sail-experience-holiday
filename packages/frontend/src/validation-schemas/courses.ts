import * as yup from "yup";
import { defaultString } from "./common";

export const renameCourseSchema = yup.object().shape({
  name: defaultString,
});

export const createCourseSchema = yup.object().shape({
  name: defaultString,
});
