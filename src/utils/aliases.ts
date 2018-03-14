import * as vscode from 'vscode';
import * as moment from 'moment';
import config from '../config';
import { request } from './common';

interface Deployment {
    id: string;
    url: string;
}

interface Rule {
    pathname: string;
    dest: string;
    method: string[] | undefined;
}

export interface NewAlias {
    uid: string;
    created: Date;
}

export interface AliasForExistingDeployment {
    oldId: string;
    uid: string;
    created: Date;
}

export interface Alias {
    uid: string;
    alias: string;
    created: Date;
    deployment: Deployment | undefined;
    rules: Rule[] | undefined;
    deploymentId: string;
}

export async function getAliases (): Promise<Alias[]> {
    const response = await request('GET', config.ENDPOINTS.ALIASES, true);
    return response.aliases;
}

export async function getAliasNames (): Promise<vscode.QuickPickItem[]> {
    const aliases = await getAliases();
    return aliases.map(alias => ({
        label: alias.alias,
        description: 'Alias created ' + moment(alias.created).fromNow()
    } as vscode.QuickPickItem));
}

export async function deleteAlias (id: Alias['uid']): Promise<void> {
    await request('DELETE', config.ENDPOINTS.ALIASES + '/' + id, true);
}