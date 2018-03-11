
import config from '../config';
import { request } from './common';

export enum StateType {
    DEPLOYING, DEPLOYMENT_ERROR, BOOTED, BUILDING, READY, BUILD_ERROR, FROZEN
}

export enum TypeType {
    NPM, DOCKER, STATIC
}

export interface Deployment {
    uid: string;
    name: string;
    url: string | null;
    created: string;
    state: StateType;
    type: TypeType;
    scale: Scale;
}

export interface Scale {
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
