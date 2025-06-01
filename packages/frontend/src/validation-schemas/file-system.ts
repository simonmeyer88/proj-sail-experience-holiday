import * as yup from "yup";
import { defaultString } from "./common";

import {
  VALID_FILESYSTEM_MIMETYPES,
  MAX_FILESYSTEM_FILE_SIZE,
} from "@aula-anclademia/common/validation-constants";

import "./file-util";

export const createFileSchema = yup.object().shape({
  name: defaultString.label("Name"),
  file: yup
    .mixed()
    .required("El archivo es requerido")
    .file({
      mimeType: yup.string().oneOf(VALID_FILESYSTEM_MIMETYPES, "Invalid type"),
      size: yup.number().max(MAX_FILESYSTEM_FILE_SIZE),
    }),
});

export const createFolderSchema = yup.object().shape({
  name: defaultString.label("Name"),
});

export const renameFolderSchema = yup.object().shape({
  name: defaultString.label("New name"),
});

export const renameFileSchema = yup.object().shape({
  name: defaultString.label("New name"),
});

export const createMultipleFilesSchema = yup.object().shape({
  files: yup.array().of(
    yup
      .mixed()
      .required("El archivo es requerido")
      .file({
        mimeType: yup
          .string()
          .oneOf(VALID_FILESYSTEM_MIMETYPES, "Invalid type"),
        size: yup.number().max(MAX_FILESYSTEM_FILE_SIZE),
      })
  ),
});
