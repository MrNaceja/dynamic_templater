import * as vscode from "vscode";
import Templater from "./Templater";
import { ContextManager } from "./ContextManager";

export function activate(context: vscode.ExtensionContext) {
  ContextManager.use(context);
  const templater = new Templater();

  /**
   * Create a new file template.
   * - Request to DEV a template name.
   * - Create a file template inside the templates folder default (or custom if defined).
   */
  const newTemplateCommand = vscode.commands.registerCommand(
    "templater.newTemplate",
    templater.newTemplate.bind(templater)
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
    "templater.newFile",
    templater.newFileBasedOnTemplate.bind(templater)
  );

  context.subscriptions.push(newTemplateCommand, newFileBasedOnTemplateCommand);
}
