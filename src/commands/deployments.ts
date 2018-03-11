import * as vscode from 'vscode';
import { deleteDeployment as remove } from '../utils/deployments';

export async function deploy () {

}

export async function deleteDeployment (id: string) {
    await remove(id);
    vscode.window.showInformationMessage('Deployment successfuly deleted');
}