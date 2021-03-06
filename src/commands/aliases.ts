import * as vscode from 'vscode';
import { deleteAlias as remove } from '../utils/aliases';
import { AliasNode } from '../explorer/models';

export async function deleteAlias (aliasNode?: AliasNode) {
    if (aliasNode) {
        try {
            await remove(aliasNode.data.uid);
            vscode.window.showInformationMessage('Alias successfuly deleted');
        } catch (error) {
            vscode.window.showErrorMessage('Delete alias error: ' + error.message);
        }
    } else {
        vscode.window.showInformationMessage('Right-click on an alias in the explorer to delete it');
    }
}

export function open (aliasNode?: AliasNode) {
    if (aliasNode) {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://' + aliasNode.data.alias));
    } else {
        vscode.window.showInformationMessage('Right-click on an alias in the explorer to open the application');
    }
}