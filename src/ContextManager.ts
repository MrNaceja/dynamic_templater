import * as vscode from "vscode";

export class ContextManager {
  static #context: vscode.ExtensionContext;
  static #terminal = vscode.window.createOutputChannel("Dynamic Templater");

  /**
   * Initialize a context manager.
   */
  public static use(context: vscode.ExtensionContext) {
    if (ContextManager.#context) {
      return ContextManager.#context;
    }
    ContextManager.#context = context;
  }

  /**
   * Log a content value on Output terminal.
   */
  public static log = (value: string, type: "info" | "warn" | "error") => {
    let prefix = {
      info: "[INFO]",
      warn: "[WARNING]",
      error: "[ERROR]",
    }[type];
    prefix ??= "[INFO]";
    ContextManager.#terminal.appendLine(`${prefix}: ${value}`);
    ContextManager.#terminal.show();
  };

  /**
   * Save a value on context state.
   */
  public static saveState = (stateId: string, stateValue: string) =>
    ContextManager.#context.globalState.update(stateId, stateValue);

  /**
   * Uses a value from context state.
   */
  public static useState = (stateId: string): string =>
    ContextManager.#context.globalState.get(stateId) || "";
}
