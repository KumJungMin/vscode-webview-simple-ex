import * as vscode from 'vscode';
import { TodoProvider } from './TodoProvider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'todoView',
			new TodoProvider(context.extensionUri)
		)
	);
}

export function deactivate() {}
