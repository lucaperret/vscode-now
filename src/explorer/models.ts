import * as vscode from 'vscode';
import * as moment from 'moment';
import { getDeployments, Deployment } from '../utils/deployments';

export class NodeBase {
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

export class DeploymentNode extends NodeBase {

    constructor(
        public readonly data: Deployment,
        public readonly eventEmitter: vscode.EventEmitter<NodeBase>
    ) {
        super(data.name);
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: `${this.label} (${moment(new Date(Number(this.data.created))).fromNow()})`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'deploymentNode'
        };
    }

}

export class RootNode extends NodeBase {

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
        return deployments.map(deployment => new DeploymentNode(deployment, this.eventEmitter));
    }
}