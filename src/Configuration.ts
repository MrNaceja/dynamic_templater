import * as vscode from "vscode";
const ExtensionSettings = vscode.workspace.getConfiguration("dynamicTemplater");

class Configuration {
  read<T>(id: string, defaultValue: T): T {
    const value = ExtensionSettings.get(id, defaultValue);
    return value === "" || value === null || value === undefined
      ? defaultValue
      : value;
  }
  write<T>(id: string, value: T) {
    ExtensionSettings.update(id, value);
  }
}

export default new Configuration();
