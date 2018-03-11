import * as keytarType from 'keytar';
import config from '../config';
import { getNodeModule, request } from '../utils/common';
const keytar = getNodeModule<typeof keytarType>('keytar');

let _authenticationToken: string | null = null;

export interface Registration {
    token: string;
    securityCode: string;
}

export function setAuthenticationToken(token: string | null): void {
    _authenticationToken = token;
    if (keytar) {
        if (token) {
            keytar.setPassword('vscode-now', 'now.token', token);
        } else {
			keytar.deletePassword('vscode-now', 'now.token');
        }
    }
}

export async function getAuthenticationToken() {
    let token;
    if (keytar) {
        token = await keytar.getPassword('vscode-now', 'now.token');
        if (token) {
            _authenticationToken = token;
        }
    }
    return _authenticationToken;
}

export async function requestLogin(email: string, tokenName: string): Promise<Registration> {
    const response = await request('POST', config.ENDPOINTS.REGISTRATION, false, { email, tokenName });
    return response;
}

export async function verifyLogin(email: string, token: string): Promise<string> {
    const response = await request('GET', config.ENDPOINTS.VERIFY, false, null, { email, token });
    return response.token;
}
