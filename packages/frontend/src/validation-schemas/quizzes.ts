import * as Yup from "yup";
import "./file-util";
import {
  MAX_QUIZ_FILE_SIZE,
  QUIZ_MAX_QUESTIONS_ATTEMPT,
  QUIZ_MIN_QUESTIONS_ATTEMPT,
  STR_MAX_LENGTH_MEDIUM,
  STR_MIN_LENGTH_MEDIUM,
  VALID_QUIZ_MIMETYPES,
} from "@aula-anclademia/common/validation-constants";

export const createQuizSchema = Yup.object({
  excelFile: Yup.mixed()
    .required("El archivo es requerido")
    .file({
      mimeType: Yup.string().oneOf(
        VALID_QUIZ_MIMETYPES,
        "El archivo debe ser un archivo de Excel"
      ),
      size: Yup.number().max(
        MAX_QUIZ_FILE_SIZE,
        `El archivo no puede pesar más de ${MAX_QUIZ_FILE_SIZE / 1000000}MB`
      ),
    }),
  courseIds: Yup.array()
    .of(Yup.string().required("El curso es requerido"))
    .required("El curso es requerido")
    .min(1),
  name: Yup.string()
    .required("El nombre es requerido")
    .min(STR_MIN_LENGTH_MEDIUM)
    .max(STR_MAX_LENGTH_MEDIUM),
});

export const updateQuizMetadataSchema = Yup.object({
  id: Yup.string().required(),
  nQuestionsPerAttempt: Yup.number()
    .required()
    .min(QUIZ_MIN_QUESTIONS_ATTEMPT)
    .max(QUIZ_MAX_QUESTIONS_ATTEMPT),
  name: Yup.string()
    .required()
    .min(STR_MIN_LENGTH_MEDIUM)
    .max(STR_MAX_LENGTH_MEDIUM),
  courseIds: Yup.array().of(Yup.string().required()).required().min(1),
});
