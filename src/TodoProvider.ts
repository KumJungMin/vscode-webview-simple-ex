import * as vscode from "vscode";

/**
 * Represents a provider for the Todo webview view.
 */
export class TodoProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _docTextList: string[] = [];

  /**
   * Creates a new instance of the TodoProvider class.
   * @param _extensionUri - The URI of the extension.
   */
  constructor(private readonly _extensionUri: vscode.Uri) {}

  /**
   * Revives the TodoProvider after a webview panel is reloaded.
   * @param panel - The webview panel to revive.
   */
  revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  /**
   * Resolves the webview view and sets up the necessary configurations.
   * @param webviewView - The webview view to be resolved.
   */
  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = { enableScripts: true };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(this.onReceiveMessage.bind(this));
  }


  /**
   * receive message from webview
   * @param data 
   * @returns 
   */ 
  private async onReceiveMessage(data: { type: string; text: string }) {
    switch (data.type) {
      case "addTodo":
        this._addTodo(data.text);
        return;
      case "update":
        this._updateWebview();
        return;
      default:
        return;
    }
  }

  /**
   * Adds a new todo item to the document text.
   * @param text - The text of the todo item.
   */
  private _addTodo(text: string) {
    this._docTextList.push(text);
  }

  /**
   * Updates the webview with the latest HTML content.
   */
  private async _updateWebview() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }

  /**
   * Generates the HTML content for the webview.
   * @param webview - The webview instance.
   * @returns The HTML content as a string.
   */
  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const listHtml = this._docTextList.map((text) => `<li>${text}</li>`).join("");

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel='stylesheet' href='${styleResetUri}' />
        <link rel='stylesheet' href='${styleVSCodeUri}' />
        <title>Todo</title>
      </head>
      <body>
        <h1>Todo</h1>
        <form id="todo-form">
          <input id="todo-input" type="text" />
          <button id="add-todo">Add</button>
        </form>
        <ul id="todo-list">
          ${ listHtml }
        </ul>
        <script>
          (function() {
            const vscode = acquireVsCodeApi();
            const btnAdd = document.getElementById('add-todo');

            btnAdd.addEventListener('click', () => {
              const input = document.getElementById('todo-input');
              vscode.postMessage({ type: 'addTodo', text: input.value });
              vscode.postMessage({ type: 'update' });

              input.value = '';
            });
          }())
      </script>
      </body>
      </html>`;
  }
}