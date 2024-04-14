import * as vscode from "vscode";
import fs from "node:fs";
import path from "node:path";
import { TTemplate, TTemplateModuleRender, TTemplateOptions } from "./types";
import Configuration from "./Configuration";
import { ContextManager } from "./ContextManager";

const TEMPLATE_EXTENSION = ".js";

export default class TemplatesManager {
  constructor() {
    ContextManager.saveState(
      "defaultTemplate",
      this.getTemplateRenderEstructure()
    );
  }

  /**
   * Manage a creation of new template file with template content renderized.
   * @see Templater.ts
   */
  createNewFileTemplate(templateName: string) {
    return this.createFileTemplate(
      templateName,
      this.getTemplateRenderEstructure()
    );
  }

  /**
   * Manage a creation of new file based on template.
   * @see Templater.ts
   */
  createNewFileBasedOnTemplate(
    template: TTemplate,
    newFileName: string,
    createFileDirectoryPath: string
  ) {
    if (this.existsTemplate(template.name)) {
      const newFileNameWithPath = path.join(
        createFileDirectoryPath,
        newFileName
      );
      if (fs.existsSync(createFileDirectoryPath)) {
        // Directory to create file exists?
        const templateOptions: TTemplateOptions = {
          createdFile: {
            fileName: path.basename(newFileName, path.extname(newFileName)),
            extension: path.extname(newFileName),
            directoryFolderName: path.basename(createFileDirectoryPath),
            directoryPath: createFileDirectoryPath,
          },
          author: {
            name: Configuration.get("author.name"),
            email: Configuration.get("author.email"),
          },
          customOptions: Configuration.get("customOptions", {}),
        };

        const templateContent = this.renderTemplateContent(
          template,
          templateOptions
        );
        fs.writeFileSync(newFileNameWithPath, templateContent);
        return newFileNameWithPath;
      }
      throw new Error("The directory to create a file not exists.");
    }
    throw new Error("Inexistent template.");
  }

  /**
   * Read a module template file rendering internal content.
   */
  private renderTemplateContent(
    template: TTemplate,
    options: TTemplateOptions
  ): string {
    let content = "";
    try {
      const templateRender: TTemplateModuleRender = require(template.path);
      try {
        content = templateRender(options);
      } catch (e) {
        throw new SyntaxError(
          "Your template has sintax errors: " + e!.toString()
        );
      }
    } catch (e) {
      let _error = "An error as ocurred rendering a template.";
      if (e instanceof SyntaxError) {
        _error = e.message;
      }
      throw new Error(_error);
    }
    return content;
  }

  /**
   * Returns the template render estructure default with module exports.
   */
  private getTemplateRenderEstructure(): string {
    const templateDefault = this.existsTemplate("default")
      ? fs.readFileSync(this.templateFilePath("default"), "utf8")
      : ContextManager.useState("defaultTemplate");
    if (!templateDefault.length) {
      throw new Error("Sorry, Cannot retrieve a template renderer default.");
    }
    return templateDefault;
  }

  /**
   * Create a template file on templates directory.
   * @returns {string} Path to created template file
   */
  public createFileTemplate(templateName: string, content: string): string {
    if (this.existsTemplate(templateName)) {
      throw new Error(
        "The template name already exists, please choose other name."
      );
    }
    this.createTemplatesDirIfNotExists();
    fs.writeFileSync(this.templateFilePath(templateName), content);
    return this.templateFilePath(templateName);
  }

  /**
   * Verify if a template already exists.
   */
  private existsTemplate(templateName: string): boolean {
    return fs.existsSync(this.templateFilePath(templateName));
  }

  /**
   * Verify if a template directory exists (checking a custom templates dir).
   */
  private existsTemplatesDir() {
    return fs.existsSync(this.templatesDirPath());
  }

  /**
   * Mount a template name with full path.
   * @example Example: .../templates/template.js
   */
  private templateFilePath = (templateName: string): string => {
    return path.join(
      this.templatesDirPath(),
      templateName + TEMPLATE_EXTENSION
    );
  };

  /**
   * Mount a template directory full path.
   * @example .../templates
   */
  private templatesDirPath(): string {
    let customTemplatesDir = vscode.workspace
      .getConfiguration()
      .get("templatesDir", null);
    return customTemplatesDir ?? path.join(__dirname, "templates");
  }

  /**
   * Create a templates directory.
   */
  private createTemplatesDirIfNotExists() {
    try {
      if (!this.existsTemplatesDir()) {
        fs.mkdirSync(this.templatesDirPath());
      }
    } catch (e) {
      console.log(e);
      throw new Error(
        "A error ocurred when trying create a templates directory."
      );
    }
  }

  /**
   * Hook to use/get templates existents.
   */
  public useTemplates = (): Promise<Map<string, TTemplate>> => {
    return new Promise((resolve, reject) => {
      fs.readdir(this.templatesDirPath(), (error, filesTemplate) => {
        if (error) {
          return reject(error);
        }
        const templates: Map<string, TTemplate> = new Map();
        const templatesDir = this.templatesDirPath();
        filesTemplate.forEach((templateFile) => {
          const templateName = path.basename(
            templateFile,
            path.extname(templateFile)
          );
          if (!templates.has(templateName)) {
            templates.set(templateName, {
              name: templateName,
              filename: templateFile,
              path: path.join(templatesDir, templateFile),
            });
          }
        });

        resolve(templates);
      });
    });
  };
}
