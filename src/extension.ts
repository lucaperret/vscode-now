'use strict';

import * as vscode from 'vscode';
import { promptLogin } from './commands/authentication';
import { deploy } from './commands/deployments';
import { NowExplorerProvider } from './explorer/nowExplorer';

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand('extension.authentication.login', promptLogin));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deployments.deploy', deploy));

    vscode.window.registerTreeDataProvider('nowExplorer', new NowExplorerProvider());
}

export function deactivate() {
}