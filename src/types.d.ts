export type TTemplate = {
  name: string;
  filename: string;
  path: string;
};

export type TTemplateModuleRender = (options: TTemplateOptions) => string;

export type TTemplateOptions = {
  currentDate: Date;
  filenameWithExtension: string;
  filePath: string;
  author: TOptionAuthor;
  customOptions: Object;
};

export type TOptionAuthor = {
  name?: string;
  email?: string;
};
