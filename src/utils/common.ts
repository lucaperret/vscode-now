import * as vscode from 'vscode';
import * as requestNative from 'request-promise-native';
import { getAuthenticationToken } from './authentication';
import config from '../config';

export function getNodeModule<T> (moduleName: string): T | undefined {
	try {
		return require(`${vscode.env.appRoot}/node_modules.asar/${moduleName}`);
	} catch (err) {}
	try {
		return require(`${vscode.env.appRoot}/node_modules/${moduleName}`);
	} catch (err) {}
	return undefined;
}

export async function request (method: string, endpoint: string, hasAuthentication?: boolean, body?: any, qs?: any) {
    let response: any;
    const headers: any = {};
    if (hasAuthentication) {
        headers.Authorization = 'Bearer ' + await getAuthenticationToken();
    }
    const options = {
		method,
        uri: config.URL + endpoint,
		headers,
		body,
		qs,
        json: true
    };
    
    try {
        response = await requestNative(options);
    } catch (e) {
        throw new Error(e.error.error.message);
    }
    
    return response;
}