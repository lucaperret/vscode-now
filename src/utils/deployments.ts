import config from '../config';
import { request } from './common';

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

export interface Deployment {
    uid: string;
    name: string;
    url: string;
    created: string;
    state: StateType;
    type: TypeType;
    scale: Scale | undefined;
}

interface Scale {
    current: number;
    min: number;
    max: number;
}

export async function deploy () {

}

export async function deleteDeployment(id: Deployment['uid']): Promise<Deployment[]> {
    const response = await request('DELETE', config.ENDPOINTS.DEPLOYMENTS + '/' + id, true);
    return response;
}

export async function getDeployments(): Promise<Deployment[]> {
    const response = await request('GET', config.ENDPOINTS.DEPLOYMENTS, true);
    return response.deployments;
}

export async function setAlias(deployment: Deployment, alias: string): Promise<Deployment[]> {
    const response = await request('POST', config.ENDPOINTS.DEPLOYMENTS + `/${deployment.uid}/aliases`, true, { alias: alias + '.now.sh' });
    return response;
}