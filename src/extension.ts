'use strict';

import * as vscode from 'vscode';
import { setToken, login, logout } from './commands/authentication';
import { deploy, deleteDeployment, open, showLogs, setAlias } from './commands/deployments';
import { NowExplorerProvider } from './explorer/nowExplorer';

const nowExplorer = new NowExplorerProvider();

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand('extension.authentication.setToken', async () => {
        await setToken();
        nowExplorer.refresh();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.authentication.login', async () => {
        await login();
        nowExplorer.refresh();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.authentication.logout', async () => {
        await logout();
        nowExplorer.refresh();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deployment.showLogs', showLogs));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deployment.open', open));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deployment.setAlias', setAlias));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deployment.deploy', deploy));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deployment.delete', async deploymentNode => {
        await deleteDeployment(deploymentNode);
        nowExplorer.refresh();
    }));

    vscode.window.registerTreeDataProvider('nowExplorer', nowExplorer);
    context.subscriptions.push(vscode.commands.registerCommand('extension.explorer.refresh', () => nowExplorer.refresh()));
}

export function deactivate() {
}
