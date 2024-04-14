import * as vscode from "vscode";

export class ContextManager {
  static #context: vscode.ExtensionContext;

  public static use(context: vscode.ExtensionContext) {
    if (ContextManager.#context) {
      return ContextManager.#context;
    }
    ContextManager.#context = context;
  }

  public static saveState = (stateId: string, stateValue: string) =>
    ContextManager.#context.globalState.update(stateId, stateValue);

  public static useState = (stateId: string): string =>
    ContextManager.#context.globalState.get(stateId) || "";
}
