import * as vscode from 'vscode';
import { deleteDeployment as remove, setAlias as alias } from '../utils/deployments';
import { DeploymentNode } from '../explorer/models';

export async function deploy () {

}

export async function deleteDeployment (deploymentNode?: DeploymentNode) {
    if (deploymentNode) {
        await remove(deploymentNode.data.uid);
        vscode.window.showInformationMessage('Deployment successfuly deleted');
    } else {
        vscode.window.showInformationMessage('Right-click on a deployment in the explorer to delete it');
    }
}

export function open (deploymentNode?: DeploymentNode) {
    if (deploymentNode) {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://' + deploymentNode.data.url));
    } else {
        vscode.window.showInformationMessage('Right-click on a deployment in the explorer to open the application');
    }
}

export function showLogs (deploymentNode?: DeploymentNode) {
    if (deploymentNode) {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://${deploymentNode.data.url}/_logs`));
    } else {
        vscode.window.showInformationMessage('Right-click on a deployment in the explorer to access logs');
    }
}

export async function setAlias (deploymentNode?: DeploymentNode) {
    if (deploymentNode) {
        const deploymentAlias = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Alias' });
        if (deploymentAlias) {
            await alias(deploymentNode.data, deploymentAlias);
            vscode.window.showInformationMessage(`Alias ${deploymentAlias}.now.sh successfuly set to the deployment ${deploymentNode.data.uid}.`);
        }
    } else {
        vscode.window.showInformationMessage('Right-click on a deployment in the explorer to set an alias');
    }
}