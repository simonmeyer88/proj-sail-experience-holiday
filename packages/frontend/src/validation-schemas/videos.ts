import * as Yup from "yup";
import { defaultString } from "./common";

export const createVideoSchema = Yup.object({
  title: defaultString,
  url: Yup.string().url().required(),
  courseIds: Yup.array().of(Yup.string().required()).required().min(1),
  date: Yup.date().required(),
});
