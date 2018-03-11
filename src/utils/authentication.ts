import * as request from 'request-promise-native';
import * as keytarType from 'keytar';
import config from '../config';
import { getNodeModule } from '../utils/common';
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
    let response: any;
    const options = {
        method: 'POST',
        uri: config.URL + config.ENDPOINTS.REGISTRATION,
        body: { email, tokenName },
        json: true
    };

    try {
        response = await request(options);
    } catch (e) {
        throw new Error(e.error.error.message);
    }

    return response;
}

export async function verifyLogin(email: string, token: string): Promise<string> {
    let response: any;
    const options = {
        uri: config.URL + config.ENDPOINTS.VERIFY,
        qs: {
            email,
            token
        },
        json: true
    };

    try {
        response = (await request(options)).token;
    } catch (e) {
        throw new Error(e.error.error.message);
    }

    return response;
}
