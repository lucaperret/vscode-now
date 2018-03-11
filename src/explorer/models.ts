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
        super(data.url);
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: `${this.label} (${moment(new Date(Number(this.data.created))).fromNow()}) - ${this.data.state}`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'deploymentNode'
        };
    }

}

export class DeploymentNameNode extends NodeBase {

    constructor(
        public readonly label: string,
        public readonly deployments: Deployment[],
        public readonly eventEmitter: vscode.EventEmitter<NodeBase>
    ) {
        super(label);
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'applicationNode'
        };
    }

    async getChildren(element: RootNode): Promise<DeploymentNode[]> {
        return this.deployments.map(deployment => new DeploymentNode(deployment, this.eventEmitter));
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

    async getChildren(element: RootNode): Promise<DeploymentNameNode[]> {
        if (element.contextValue === 'deploymentsRootNode') {
            return this.getDeployments();
        }
        return [];
    }

    private async getDeployments(): Promise<DeploymentNameNode[]> {
        const deployments = await getDeployments();
        const applications = new Map();
        for (const deployment of deployments) {
            if (applications.has(deployment.name)) {
                applications.get(deployment.name).push(deployment);
            } else {
                applications.set(deployment.name, [deployment]);
            }
        }
        return Array.from(applications).map(([name, deployments]) => new DeploymentNameNode(name, deployments, this.eventEmitter));
    }

}