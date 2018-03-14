import config from '../config';
import { request } from './common';
import { NewAlias, AliasForExistingDeployment } from './aliases';

export enum StateType {
    DEPLOYING = 'DEPLOYING',
    DEPLOYMENT_ERROR = 'DEPLOYMENT_ERROR',
    BOOTED = 'BOOTED',
    BUILDING = 'BUILDING',
    READY = 'READY',
    BUILD_ERROR = 'BUILD_ERROR',
    FROZEN = 'FROZEN'
}

enum TypeType {
    NPM = 'NPM',
    DOCKER = 'DOCKER',
    STATIC = 'STATIC'
}

interface Creator {
    uid: string;
}

export interface Deployment {
    uid: string;
    name: string;
    url: string;
    created: string;
    state: StateType;
    type: TypeType;
    scale: Scale | undefined;
    creator: Creator;
}

interface Scale {
    current: number;
    min: number;
    max: number;
}

export async function deploy (folder: string) {
    const files = [];
    await request('DELETE', config.ENDPOINTS.NEW_DEPLOYMENT, true);
}

export async function deleteDeployment (id: Deployment['uid']): Promise<void> {
    await request('DELETE', config.ENDPOINTS.DEPLOYMENTS + '/' + id, true);
}

export async function getDeployments (): Promise<Deployment[]> {
    const response = await request('GET', config.ENDPOINTS.DEPLOYMENTS, true);
    return response.deployments;
}

export async function setAlias (deployment: Deployment, alias: string): Promise<NewAlias | AliasForExistingDeployment> {
    return await request('POST', config.ENDPOINTS.DEPLOYMENTS + `/${deployment.uid}/aliases`, true, { alias });
}