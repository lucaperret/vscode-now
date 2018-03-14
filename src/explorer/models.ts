import * as vscode from 'vscode';
import * as path from 'path';
import * as moment from 'moment';
import { getDeployments, Deployment, StateType } from '../utils/deployments';
import { getAliases, Alias } from '../utils/aliases';

export class NodeBase {
    readonly label: string;

    protected constructor (label: string) {
        this.label = label;
    }

    getTreeItem (): vscode.TreeItem {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }

    async getChildren (element: NodeBase): Promise<NodeBase[]> {
        return [];
    }
}

export class AliasNode extends NodeBase {

    constructor (
        public readonly data: Alias,
        public readonly eventEmitter: vscode.EventEmitter<NodeBase>
    ) {
        super(data.alias);
    }

    getTreeItem (): vscode.TreeItem {
        return {
            label: `${this.label} (${moment(new Date(this.data.created)).fromNow()})`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'aliasNode'
        };
    }

}

export class DeploymentNode extends NodeBase {

    constructor (
        public readonly data: Deployment,
        public readonly eventEmitter: vscode.EventEmitter<NodeBase>
    ) {
        super(data.url);
    }

    getTreeItem (): vscode.TreeItem {
        let icon;
        if (this.data.state === StateType.READY) {
            icon = 'runningDeployment';
        } else if (~[StateType.BOOTED, StateType.BUILDING, StateType.DEPLOYING].indexOf(this.data.state)) {
            icon = 'deployment';
        } else {
            icon = 'errorDeployment';
        }
        return {
            label: `${this.label} (${moment(new Date(Number(this.data.created))).fromNow()}) - ${this.data.state}`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'deploymentNode',
            iconPath: {
                light: path.join(__filename, '..', '..', '..', 'resources', 'light', icon + '.svg'),
                dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', icon + '.svg')
            }
        };
    }

}

export class DeploymentNameNode extends NodeBase {

    constructor (
        public readonly label: string,
        public readonly deployments: Deployment[],
        public readonly eventEmitter: vscode.EventEmitter<NodeBase>
    ) {
        super(label);
    }

    getTreeItem (): vscode.TreeItem {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'applicationNode'
        };
    }

    async getChildren (element: RootNode): Promise<DeploymentNode[]> {
        return this.deployments.map(deployment => new DeploymentNode(deployment, this.eventEmitter));
    }

}

export class RootNode extends NodeBase {

    constructor (
        public readonly label: string,
        public readonly contextValue: string,
        public eventEmitter: vscode.EventEmitter<NodeBase>
    ) {
        super(label);
    }

    getTreeItem (): vscode.TreeItem {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: this.contextValue
        };
    }

    async getChildren (element: RootNode): Promise<NodeBase[]> {
        if (element.contextValue === 'deploymentsRootNode') {
            return this.getDeployments();
        } else if (element.contextValue === 'aliasesRootNode') {
            return this.getAliases();
        }
        return [];
    }

    private async getDeployments (): Promise<DeploymentNameNode[]> {
        return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Loading deployments' }, async progress => {
            try {
                const deployments: Deployment[] = await getDeployments();
                const applications = new Map();
                for (const deployment of deployments) {
                    if (applications.has(deployment.name)) {
                        applications.get(deployment.name).push(deployment);
                    } else {
                        applications.set(deployment.name, [deployment]);
                    }
                }
                return Array.from(applications).map(([name, deployments]) => new DeploymentNameNode(name, deployments, this.eventEmitter));
            } catch (error) {
                vscode.window.showErrorMessage('Get deployments error: ' + error.message);
                return [];
            }
        });
    }

    private async getAliases (): Promise<AliasNode[]> {
        return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Loading aliases' }, async progress => {
            try {
                const aliases: Alias[] = await getAliases();
                return aliases.map(alias => new AliasNode(alias, this.eventEmitter));
            } catch (error) {
                vscode.window.showErrorMessage('Get aliases error: ' + error.message);
                return [];
            }
        });
    }

}