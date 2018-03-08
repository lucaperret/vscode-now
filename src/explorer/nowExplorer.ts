import * as vscode from 'vscode';
import { getDeployments } from '../utils/deployments';

export class NowExplorerProvider implements vscode.TreeDataProvider<NodeBase> {

    private _onDidChangeTreeData: vscode.EventEmitter<NodeBase> = new vscode.EventEmitter<NodeBase>();
    readonly onDidChangeTreeData: vscode.Event<NodeBase> = this._onDidChangeTreeData.event;
    private _deploymentsNode: RootNode = new RootNode('Deployments', 'deploymentsRootNode', this._onDidChangeTreeData);

    constructor() {
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(this._deploymentsNode);
    }

    refreshDeployments(): void {
        this._onDidChangeTreeData.fire(this._deploymentsNode);
    }
    
    getTreeItem(element: NodeBase): vscode.TreeItem {
        return element.getTreeItem();
    }

    async getChildren(element?: NodeBase): Promise<NodeBase[]> {
        if (!element) {
            return this.getRootNodes();
        }
        return element.getChildren(element);
    }

    private async getRootNodes(): Promise<RootNode[]> {
        const rootNodes: RootNode[] = [];

        rootNodes.push(this._deploymentsNode);

        return rootNodes;
    }

}


class NodeBase {
    readonly label: string;

    protected constructor(label: string) {
        this.label = label;
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }

    async getChildren(element: NodeBase): Promise<NodeBase[]> {
        return [];
    }
}

class RootNode extends NodeBase {

    constructor(
        public readonly label: string,
        public readonly contextValue: string,
        public eventEmitter: vscode.EventEmitter<NodeBase>
    ) {
        super(label);
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: this.contextValue
        };
    }

    async getChildren(element: RootNode): Promise<NodeBase[]> {
        if (element.contextValue === 'deploymentsRootNode') {
            return this.getDeployments();
        }
        return [];
    }

    private async getDeployments(): Promise<NodeBase[]> {
        const deployments = await getDeployments();
        return deployments.map(deployment => new NodeBase(deployment.name));
    }
}