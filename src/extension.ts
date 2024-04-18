import * as vscode from "vscode";
import DynamicTemplater from "./DynamicTemplater";
import { ContextManager } from "./ContextManager";

export function activate(context: vscode.ExtensionContext) {
  ContextManager.use(context);
  const engine = new DynamicTemplater();

  /**
   * Create a new file template.
   * - Request to DEV a template name.
   * - Create a file template inside the templates folder default (or custom if defined).
   */
  const newTemplateCommand = vscode.commands.registerCommand(
    "dynamictemplater.newTemplate",
    engine.newTemplate.bind(engine)
  );

  /**
   * Create a new file based on file template.
   * - Request to DEV a file name (with extension)
   * - Request to DEV a file template to base
   * - Create a new file with content rendered by template
   *
   * This command is visible only on context menu explorer...
   */
  const newFileBasedOnTemplateCommand = vscode.commands.registerCommand(
    "dynamictemplater.newFile",
    engine.newFileBasedOnTemplate.bind(engine)
  );

  /**
   * Open a current templates folder.
   */
  const openTemplatesDirectoryCommand = vscode.commands.registerCommand(
    "dynamictemplater.openTemplatesDirectory",
    engine.openTemplatesDirectory.bind(engine)
  );

  context.subscriptions.push(
    newTemplateCommand,
    newFileBasedOnTemplateCommand,
    openTemplatesDirectoryCommand
  );
}
