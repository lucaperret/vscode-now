import * as vscode from 'vscode';
import { NodeBase, RootNode } from './models';
import { getAuthenticationToken } from '../utils/authentication';

export class NowExplorerProvider implements vscode.TreeDataProvider<NodeBase> {

    private _onDidChangeTreeData: vscode.EventEmitter<NodeBase> = new vscode.EventEmitter<NodeBase>();
    readonly onDidChangeTreeData: vscode.Event<NodeBase> = this._onDidChangeTreeData.event;
    private _deploymentsNode: RootNode = new RootNode('Deployments', 'deploymentsRootNode', this._onDidChangeTreeData);
    private _aliasesNode: RootNode = new RootNode('Aliases', 'aliasesRootNode', this._onDidChangeTreeData);

    refresh (): void {
        this._onDidChangeTreeData.fire();
    }
    
    getTreeItem (element: NodeBase): vscode.TreeItem {
        return element.getTreeItem();
    }

    async getChildren (element?: NodeBase): Promise<NodeBase[]> {
        if (!element) {
            return this.getRootNodes();
        }
        return element.getChildren(element);
    }

    private async getRootNodes (): Promise<RootNode[]> {
        const rootNodes: RootNode[] = [];
        
        let token = await getAuthenticationToken();
        if (!token) {
            return rootNodes;
        }

        rootNodes.push(this._deploymentsNode);
        rootNodes.push(this._aliasesNode);

        return rootNodes;
    }

}
