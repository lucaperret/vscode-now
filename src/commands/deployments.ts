import * as vscode from 'vscode';
import * as fs from 'fs';
import { deploy as deployFolder, deleteDeployment as remove, setAlias as alias } from '../utils/deployments';
import { DeploymentNode } from '../explorer/models';
import { getAliasNames } from '../utils/aliases';

export async function deploy () {
    const folder = await vscode.window.showWorkspaceFolderPick({ ignoreFocusOut: true, placeHolder: 'Which folder to deploy ?' });
    if (folder) {
        const pathToDeploy = folder.uri.path;
        try {
            const result = fs.readdirSync(pathToDeploy);
            console.log(result);
            // await deployFolder(pathToDeploy);
            vscode.window.showInformationMessage('Deployment successfuly deleted');
        } catch (error) {
            vscode.window.showErrorMessage('Deployment error: ' + error.message);
        }
    }
}

export async function deleteDeployment (deploymentNode?: DeploymentNode) {
    if (deploymentNode) {
        try {
            await remove(deploymentNode.data.uid);
            vscode.window.showInformationMessage('Deployment successfuly deleted');
        } catch (error) {
            vscode.window.showErrorMessage('Delete deployment error: ' + error.message);
        }
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

export async function setCustomAlias (deploymentNode?: DeploymentNode) {
    if (deploymentNode) {
        const deploymentAlias = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Alias (my-alias.now.sh or my-domain.tld)' });
        if (deploymentAlias) {
            try {
                await alias(deploymentNode.data, deploymentAlias);
                vscode.window.showInformationMessage(`Alias ${deploymentAlias}.now.sh successfuly set to the deployment ${deploymentNode.data.url}.`);
            } catch (error) {
                vscode.window.showErrorMessage('Set custom alias error: ' + error.message);
            }
        }
    } else {
        vscode.window.showInformationMessage('Right-click on a deployment in the explorer to set an alias');
    }
}

export async function setExistingAlias (deploymentNode?: DeploymentNode) {
    if (deploymentNode) {
        const selectedAlias = await vscode.window.showQuickPick(getAliasNames(), { placeHolder: 'Choose an existing alias...' });
        if (selectedAlias) {
            try {
                await alias(deploymentNode.data, selectedAlias.label);
                vscode.window.showInformationMessage(`Alias ${selectedAlias.label} successfuly set to the deployment ${deploymentNode.data.url}.`);
            } catch (error) {
                vscode.window.showErrorMessage('Set existing alias error: ' + error.message);
            }
        }
    } else {
        vscode.window.showInformationMessage('Right-click on a deployment in the explorer to set an alias');
    }
}