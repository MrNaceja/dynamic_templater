import * as vscode from "vscode";
import Templater from "./Templater";

export function activate(context: vscode.ExtensionContext) {
  const templater = new Templater();

  const newTemplateCommand = vscode.commands.registerCommand(
    "templater.newTemplate",
    templater.newTemplate.bind(templater)
  );

  const newFileTemplateCommand = vscode.commands.registerCommand(
    "templater.newFile",
    templater.newFileBasedOnTemplate.bind(templater)
  );

  context.subscriptions.push(newTemplateCommand, newFileTemplateCommand);
}
