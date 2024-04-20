import * as vscode from "vscode";
import TemplatesManager from "./TemplatesManager";
import { TTemplate } from "./types";
import { ContextManager } from "./ContextManager";

export default class DynamicTemplater {
  #templatesManager = new TemplatesManager();

  /**
   * Create a new file template.
   * - Request to DEV a template name.
   * - Create a file template inside the templates folder default (or custom if defined).
   */
  async newTemplate() {
    const templateName = await this.requestTemplateName();
    if (!templateName) {
      return;
    }
    try {
      const createdFilePath =
        this.#templatesManager.createNewFileTemplate(templateName);
      if (createdFilePath) {
        vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.file(createdFilePath)
        );
        vscode.window.showInformationMessage(
          `Template ${templateName} created with sucessful. 🥳`
        );
        ContextManager.log("Template created with sucessful.", "info");
      }
    } catch (e) {
      let _error = "A unhandled problem has ocurred. Sorry.";
      if (e instanceof Error) {
        _error = e.message;
      }
      vscode.window.showInformationMessage(_error);
      ContextManager.log(_error, "error");
    }
  }

  /**
   * Create a new file based on file template.
   * - Request to DEV a file name (with extension)
   * - Request to DEV a file template to base
   * - Create a new file with content rendered by template
   */
  async newFileBasedOnTemplate(creationFileContext?: any) {
    let pathContext: string | null = creationFileContext?._fsPath ?? null;
    if (!pathContext) {
      if (!pathContext) {
        pathContext = vscode.workspace.workspaceFile?.fsPath ?? null;
      }
      if (!pathContext) {
        vscode.window.showErrorMessage(
          "Sorry, is not possible create a file over here."
        );
        return;
      }
    }
    const templateSelected = await this.requestTemplateSelection();
    if (!templateSelected) {
      return;
    }

    const newFileName = await this.requestFileName();
    if (!newFileName) {
      return;
    }

    try {
      const createdFilePath =
        this.#templatesManager.createNewFileBasedOnTemplate(
          templateSelected,
          newFileName,
          pathContext
        );
      if (createdFilePath) {
        vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.file(createdFilePath)
        );
        vscode.window.showInformationMessage(
          `New File ${newFileName} created with sucessful. 🥳`
        );
        ContextManager.log("New file created.", "info");
      }
    } catch (e) {
      let _error = "A unhandled problem has ocurred. Sorry.";
      if (e instanceof Error) {
        _error = e.message;
      }
      vscode.window.showErrorMessage(_error);
      ContextManager.log(_error, "error");
    }
  }

  /**
   * Open a current templates folder.
   */
  openTemplatesDirectory() {
    try {
      this.#templatesManager.openTemplatesDirectoryInFileExplorer();
      ContextManager.log(
        "Template current folder directory is opened.",
        "info"
      );
    } catch (e) {
      let _error = "An Error as ocurred when try open templates directory.";
      if (e instanceof Error) {
        _error = e.message;
      }
      vscode.window.showErrorMessage(_error);
      ContextManager.log(_error, "error");
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
          return false;
        }
        if (!fileName.includes(".")) {
          vscode.window.showErrorMessage(
            "Opss, we need a file name with extension."
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
      .showQuickPick<vscode.QuickPickItem & { template: string }>(
        templateOptions.map((template) => ({
          template: template.name,
          label:
            template.name.at(0)?.toUpperCase() + template.name.substring(1),
          description: template.filename,
          iconPath: new vscode.ThemeIcon("file-code"),
          picked: template.name === "default",
        })),
        {
          placeHolder: "Select a template to create based on this",
          title: "Choose a Template",
        }
      )
      .then((templateSelected) => {
        if (!templateSelected) {
          return false;
        }
        return templates.get(templateSelected.template) as TTemplate;
      });
  };
}
