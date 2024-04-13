import * as vscode from "vscode";
import fs from "node:fs";
import path from "node:path";
import { TTemplate, TTemplateModuleRender, TTemplateOptions } from "./types";

const TEMPLATE_EXTENSION = ".js";

export default class TemplatesManager {
  createFileTemplate(templateName: string) {
    if (this.existsTemplate(templateName)) {
      throw new Error(
        "The template name already exists, please choose other name."
      );
    }

    fs.writeFileSync(
      this.templatePath(templateName),
      this.getTemplateEstructure()
    );
    return true;
  }

  async createNewFileBasedOnTemplate(
    template: TTemplate,
    newFileName: string,
    pathContext: string
  ) {
    if (this.existsTemplate(template.name)) {
      const newFileNameWithPath = path.join(pathContext, newFileName);

      if (fs.existsSync(pathContext)) {
        const templateOptions: TTemplateOptions = {
          currentDate: new Date(),
          filenameWithExtension: newFileName,
          filePath: pathContext,
          author: {
            name: "a",
            email: "b",
          },
        };

        const templateContent = await this.renderTemplateContent(
          template,
          templateOptions
        );
        // Se o diretório realmente existe...
        fs.writeFileSync(newFileNameWithPath, templateContent);
      }
    }
    return true;
  }

  private async renderTemplateContent(
    template: TTemplate,
    options: TTemplateOptions
  ): Promise<string> {
    let content = "";
    try {
      const templateModule: TTemplateModuleRender = await import(template.path);
      // const templateModule: TTemplateModuleRender = require(template.path);
      content = templateModule(options);
    } catch (e) {
      throw new Error("An error as ocurred rendering a template.");
    }
    return content;
  }

  /**
   * Returns the template estructure default as module exports.
   */
  private getTemplateEstructure() {
    if (this.existsTemplate("default")) {
      return fs.readFileSync(this.templatePath("default"), "utf8");
    }
    return `/**
 * @typedef  {Object       } TTemplateOptions
 * @property {Date         } currentDate
 * @property {string       } filenameWithExtension
 * @property {string       } filePath
 * @property {TOptionAuthor} author
 *
 * @typedef  {Object } TOptionAuthor
 * @property {string?} name
 * @property {string?} email
 *
 * @type {TTemplateOptions} options
 */
export default (options) => \`

/**
 * This is a \${options.filenameWithExtension\} file created with template! :)
 * 
 * @author \${\`\${options.author.name\} - \${options.author.email\}\`\} 
 * @since \${options.currentDate.toLocaleDateString()}
 */

\`;
`;
  }

  /**
   * Verify if a template already exists.
   */
  public existsTemplate(templateName: string): boolean {
    return fs.existsSync(this.templatePath(templateName));
  }

  /**
   * Mount a template name with full path.
   * @example Example: .../templates/template.js
   */
  public templatePath = (templateName: string): string => {
    return path.join(this.templatesDir(), templateName + TEMPLATE_EXTENSION);
  };

  /**
   * Mount a template directory full path (verify if has a custom templates directory on configuration).
   * @example .../templates
   */
  public templatesDir(): string {
    let templatesDir = vscode.workspace
      .getConfiguration()
      .get("templatesDir", null);

    // Se existir um diretório de templates personalizado configurado utiliza este
    if (templatesDir) {
      if (!fs.existsSync(templatesDir)) {
        this.createTemplatesDir(templatesDir);
      }
      return templatesDir;
    }

    return path.join(__dirname, "templates");
  }

  /**
   * Create a templates directory.
   */
  private createTemplatesDir(templatesDirName: string) {
    try {
      if (!fs.existsSync(templatesDirName)) {
        fs.mkdirSync(templatesDirName);
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
      fs.readdir(this.templatesDir(), (error, filesTemplate) => {
        if (error) {
          return reject(error);
        }
        const templates: Map<string, TTemplate> = new Map();
        const templatesDir = this.templatesDir();
        filesTemplate.forEach((templateFile) => {
          let templateName = templateFile.split(".").at(0) as string;
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
