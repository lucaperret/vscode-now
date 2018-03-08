
import * as request from 'request-promise-native';
import config from '../config';

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

export async function getDeployments(): Promise<Deployment[]> {
    let response: any;
    const options = {
        uri: config.URL + config.ENDPOINTS.DEPLOYMENTS,
        json: true
    };

    try {
        response = await request(options);
    } catch (e) {
        throw new Error(e.error.error.message);
    }

    return response.deployments;
}