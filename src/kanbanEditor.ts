import { v4 as uuidv4 } from 'uuid';
import * as vscode from 'vscode';

import { Kanban, toJson } from './kanban/models/kanban';

export class KanbanEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new KanbanEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      KanbanEditorProvider.viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    );
    return providerRegistration;
  }

  private static readonly viewType = 'portable-kanban.edit';

  constructor(private readonly context: vscode.ExtensionContext) { }

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    let initialized = false;

    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    const updateWebview = () => {
      webviewPanel.webview.postMessage({
        type: 'update',
        title: document.uri.path
          .split('/')
          ?.slice(-1)[0]
          ?.replace('.kanban', ''),
        text: document.getText(),
      });
    };

    webviewPanel.webview.onDidReceiveMessage((e) => {
      switch (e.type) {
        case 'load':
          updateWebview();
          return;
        case 'edit':
          if (!initialized) {
            initialized = true;
            return;
          }
          this.updateTextDocument(document, e.kanban);
          return;
        case 'info-message':
          vscode.window.showInformationMessage(e.message, {
            modal: false,
          });
          return;
        case 'open':
          vscode.env.openExternal(vscode.Uri.parse(e.url));
          return;
        case 'card-file':
          vscode.window.showInformationMessage(e.card_title);
      }
    });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'kanban.js')
    );
    const theme = vscode.workspace
      .getConfiguration()
      .get('portable-kanban.theme') as 'dark' | 'light' | 'system';
    const showDescription =
      vscode.workspace
        .getConfiguration()
        .get('portable-kanban.show-description') ?? true;
    const showTaskList =
      vscode.workspace
        .getConfiguration()
        .get('portable-kanban.show-task-list') ?? true;
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        'assets',
        'css',
        'main.css'
      )
    );
    const themeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        'assets',
        'css',
        theme === 'dark'
          ? 'dark.css'
          : theme === 'light'
            ? 'light.css'
            : 'system.css'
      )
    );
    const nonce = uuidv4();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: ${webview.cspSource}; style-src 'unsafe-inline' https://fonts.googleapis.com ${webview.cspSource}; font-src https://fonts.gstatic.com; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;800&display=swap" rel="stylesheet">
				<title>Portable Kanban</title>
        <link rel="stylesheet" nonce="${nonce}" href="${cssUri}">
        <link rel="stylesheet" nonce="${nonce}" href="${themeUri}">
			</head>
			<body>
        <script nonce="${nonce}">
          window.settings = {
            showDescription: ${showDescription},
            showTaskList: ${showTaskList},
          };
        </script>
				<div id="root">
				</div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }

  private updateTextDocument(document: vscode.TextDocument, kanban: Kanban) {
    const text = toJson(kanban);

    if (document.getText() === text) {
      return;
    }

    const edit = new vscode.WorkspaceEdit();
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      toJson(kanban)
    );

    return vscode.workspace.applyEdit(edit);
  }
}
