import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { createDeployment, deleteDeployment as remove, setAlias as alias, DeploymentTypeType } from '../utils/deployments';
import { DeploymentNode } from '../explorer/models';
import { getAliasNames } from '../utils/aliases';

export async function deploy () {
    const folder = await vscode.window.showWorkspaceFolderPick({ ignoreFocusOut: true, placeHolder: 'Which folder to deploy ?' });
    if (folder) {
        const pathToDeploy = folder.uri.path;
        try {
            const files = fs.readdirSync(pathToDeploy);
            let deployType: DeploymentTypeType;
            const hasDockerfile = !!~files.indexOf('Dockerfile');
            const hasPackageJson = !!~files.indexOf('package.json');
            if (hasDockerfile && hasPackageJson) {
                deployType = <DeploymentTypeType>await vscode.window.showQuickPick([DeploymentTypeType.NPM, DeploymentTypeType.DOCKER], { placeHolder: 'Choose a deployment type...' });
                if (!deployType) {
                    return vscode.window.showErrorMessage('You should determine wich deployment type.');
                }
            } else if (hasDockerfile) {
                deployType = DeploymentTypeType.DOCKER;
            } else if (hasPackageJson) {
                deployType = DeploymentTypeType.NPM;
            } else {
                deployType = DeploymentTypeType.STATIC;
            }
            const deploymentName = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Deployment name', value: path.parse(pathToDeploy).name });
            if (deploymentName) {
                return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Deploying on ▲ZEIT now...' }, async progress => {
                    const url = await createDeployment(progress, pathToDeploy, deploymentName, deployType);
                    vscode.window.showInformationMessage('Successfully deployed !', `https://${url}`)
                        .then(clickedLink => {
                            if (clickedLink) {
                                vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(clickedLink));
                            }
                        });
                });
            } else {
                vscode.window.showErrorMessage('You should provide a deployment name.');
            }
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