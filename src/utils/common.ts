import * as fs from 'fs';
import * as vscode from 'vscode';
import * as requestNative from 'request-promise-native';
import { getAuthenticationToken } from './authentication';
import config from '../config';

const IS_WIN = process.platform.startsWith('win');
const SEP = IS_WIN ? '\\' : '/';

export function getNodeModule<T> (moduleName: string): T | undefined {
	try {
		return require(`${vscode.env.appRoot}/node_modules.asar/${moduleName}`);
	} catch (err) {}
	try {
		return require(`${vscode.env.appRoot}/node_modules/${moduleName}`);
	} catch (err) {}
	return undefined;
}

export async function request (method: string, endpoint: string, hasAuthentication?: boolean, body?: any, qs?: any, headers: any = {}) {
    let response: any;
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

export function requireFile (modulePath: string, _default = {}) {
    try {
        return require(modulePath);
    } catch (error) {
        return _default;
    }
}

export function mayBeRead (filePath: string, _default = null) {
    try {
        return fs.readFileSync(filePath);
    } catch (error) {
        return _default;
    }
}

export function absoluteToRelative (base: string, filePath: string) {
    const fullBase = base.endsWith(SEP) ? base : base + SEP;
    let relative = filePath.substr(fullBase.length);
  
    if (relative.startsWith(SEP)) {
      relative = relative.substr(1);
    }
  
    return relative.replace(/\\/g, '/');
}