import * as Yup from "yup";

export type ValidationOptions = {
  mimeType?: Yup.StringSchema;
  size?: Yup.NumberSchema;
  name?: Yup.StringSchema;
};

declare module "yup" {
  interface Schema {
    file(options?: ValidationOptions, errorMessage?: string): this;
  }
}

const YUP_FILE_METHOD = "file";

Yup.addMethod<Yup.MixedSchema>(
  Yup.mixed,
  YUP_FILE_METHOD,
  function addMethod(
    { mimeType, size, name }: ValidationOptions,
    errorMessage?: string
  ) {
    return this.test({
      name: YUP_FILE_METHOD,
      message: errorMessage,
      test(value) {
        const obj = {
          mimeType,
          size,
          name,
        } as Record<string, Yup.Schema<any>>;

        const objSchema = Yup.object().shape({ ...obj });

        if (!value) return true; // use required(), by default file is optional
        if (!(value instanceof File)) {
          return this.createError({
            message: errorMessage || "{path} is not a file",
          });
        }

        try {
          objSchema.validateSync({
            mimeType: value.type,
            size: value.size,
            name: value.name,
          });
        } catch (err: any) {
          return this.createError({
            message: err.message,
          });
        }
        return true;
      },
    });
  }
);
