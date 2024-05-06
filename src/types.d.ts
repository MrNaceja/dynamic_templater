export type TTemplate = {
  name: string;
  filename: string;
  path: string;
};

export type TTemplateModuleRender = (options: TTemplateOptions) => string;

export type TTemplateOptions = {
  createdFile: TOptionCreatedFile;
  author: TOptionAuthor;
  customOptions: any;
};

export type TOptionCreatedFile = {
  fileName: string;
  extension: string;
  directoryFolderName: string;
  directoryPath: string;
};

export type TOptionAuthor = {
  name?: string;
  email?: string;
};
