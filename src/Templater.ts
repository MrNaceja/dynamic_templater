import * as vscode from "vscode";
import TemplatesManager from "./TemplatesManager";
import { TTemplate } from "./types";

export default class Templater {
  #templatesManager = new TemplatesManager();

  /**
   * Create a new file template.
   * - Request to DEV a template name.
   * - Create a file template inside the templates folder default (or custom if configured).
   */
  async newTemplate() {
    const templateName = await this.requestTemplateName();
    if (!templateName) {
      return;
    }
    try {
      if (this.#templatesManager.createFileTemplate(templateName)) {
        vscode.window.showInformationMessage(
          `Template ${templateName} created with sucessful. 🥳`
        );
      }
    } catch (e) {
      let _error = "A unhandled problem has ocurred. Sorry.";
      if (e instanceof Error) {
        _error = e.message;
      }
      vscode.window.showInformationMessage(_error);
    }
  }

  /**
   * Create a new file based on file template.
   * - Request to DEV a file name (with extension)
   * - Request to DEV a file template to base
   * - Create a new file with content rendered by template
   */
  async newFileBasedOnTemplate(creationFileContext?: any) {
    let pathContext = creationFileContext?._fsPath ?? null;
    if (!pathContext) {
      if (vscode.window.activeTextEditor) {
        pathContext = vscode.window.activeTextEditor.document.fileName;
      }
      if (!pathContext) {
        pathContext = vscode.workspace.workspaceFile?.fsPath ?? null;
      }
      if (!pathContext) {
        vscode.window.showErrorMessage(
          "Sorry, an error as ocurred trying create file."
        );
        return;
      }
    }

    const newFileName = await this.requestFileName();
    if (!newFileName) {
      return;
    }
    const templateSelected = await this.requestTemplateSelection();
    if (!templateSelected) {
      return;
    }
    try {
      const sucess = await this.#templatesManager.createNewFileBasedOnTemplate(
        templateSelected,
        newFileName,
        pathContext
      );
      if (sucess) {
        vscode.window.showInformationMessage(
          `New File ${newFileName} created with sucessful. 🥳`
        );
      }
    } catch (e) {
      let _error = "A unhandled problem has ocurred. Sorry.";
      if (e instanceof Error) {
        _error = e.message;
      }
      vscode.window.showInformationMessage(_error);
    }
  }

  /**
   * Request the template name for DEV by VSCode UI.
   */
  private requestTemplateName = async (): Promise<string | false> => {
    return await vscode.window
      .showInputBox({
        prompt: "What´s a template name?",
        placeHolder: "Template name goes here...",
        title: "Naming your template",
      })
      .then(async (templateName) => {
        if (!templateName) {
          vscode.window.showErrorMessage("Opss, we need a template name!");
          return false;
        }
        return templateName.includes(".")
          ? (templateName.split(".").at(0) as string) // Removing extension, if present :>
          : templateName;
      });
  };

  /**
   * Request the new file name for DEV by VSCode UI.
   */
  private requestFileName = async (): Promise<string | false> => {
    return await vscode.window
      .showInputBox({
        prompt: "What´s a new file name?",
        placeHolder: "New file name goes here...",
        title: "Naming your file",
      })
      .then(async (fileName) => {
        if (!fileName) {
          vscode.window.showErrorMessage("Opss, we need a file name!");
          return false;
        }
        if (!fileName.includes(".")) {
          vscode.window.showErrorMessage(
            "Opss, we need a file name with extension!"
          );
          return false;
        }
        return fileName;
      });
  };

  /**
   * Request the template selection to use for render content on file.
   */
  private requestTemplateSelection = async (): Promise<TTemplate | false> => {
    const templates = await this.#templatesManager.useTemplates();
    const templateOptions = Array.from(templates.values());
    return await vscode.window
      .showQuickPick(
        templateOptions.map(
          (
            template // Formatando a primeira letra para caixa alta...
          ) => ({
            label:
              template.name.at(0)?.toUpperCase() + template.name.substring(1),
            template,
          })
        ),
        {
          placeHolder: "Select a template to create based on",
        }
      )
      .then((templateSelected) => {
        if (!templateSelected) {
          vscode.window.showErrorMessage(
            "Opss, you need select a template to continue!"
          );
          return false;
        }
        return templates.get(templateSelected.template.name) as TTemplate;
      });
  };
}
