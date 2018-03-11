import * as vscode from 'vscode';
import { deleteDeployment as remove, setAlias as alias } from '../utils/deployments';
import { DeploymentNode } from '../explorer/models';

export async function deploy () {

}

export async function deleteDeployment (id: string) {
    await remove(id);
    vscode.window.showInformationMessage('Deployment successfuly deleted');
}

export function open (deploymentNode: DeploymentNode) {
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://' + deploymentNode.data.url));
}

export function showLogs (deploymentNode: DeploymentNode) {
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://${deploymentNode.data.url}/_logs`));
}

export async function setAlias (deploymentNode: DeploymentNode) {
    const deploymentAlias = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Alias' });
    if (deploymentAlias) {
        await alias(deploymentNode.data, deploymentAlias);
        vscode.window.showInformationMessage(`Alias ${deploymentAlias}.now.sh successfuly set to the deployment ${deploymentNode.data.uid}.`);
    }
}