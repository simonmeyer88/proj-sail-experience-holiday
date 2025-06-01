import * as yup from "yup";
import { defaultString } from "./common";

export const createChatSchema = yup.object().shape({
  name: defaultString,
});
