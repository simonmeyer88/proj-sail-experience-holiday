export const STR_MAX_LENGTH = 40;
export const STR_MIN_LENGTH = 3;

export const STR_MAX_LENGTH_MEDIUM = 120;
export const STR_MIN_LENGTH_MEDIUM = 3;

export const STR_MAX_LENGTH_LONG = 255;
export const STR_MIN_LENGTH_LONG = 3;

export const EVENT_MIN_SLOTS = 1;
export const EVENT_MAX_SLOTS = 100;
export const QUIZ_MIN_QUESTIONS_ATTEMPT = 5;
export const QUIZ_MAX_QUESTIONS_ATTEMPT = 20;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

export const VALID_FILESYSTEM_MIMETYPES = [
  "application/msword", // doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/pdf", // pdf
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/vnd.ms-excel", // xls
  "text/csv", // csv
  "image/png", // png
  "image/jpeg", // jpeg
  "image/jpg", // jpg
];
export const MAX_FILESYSTEM_FILE_SIZE = 104857600; // 100MB

export const MAX_PROFILEPIC_FILE_SIZE = 10485760; // 10MB
export const VALID_PROFILEPIC_MIMETYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
];

export const MAX_QUIZ_FILE_SIZE = 10485760; // 10MB
export const VALID_QUIZ_MIMETYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/vnd.ms-excel", // xls,
  "text/csv", // csv
];
