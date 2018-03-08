
import * as vscode from 'vscode';
import * as request from 'request-promise-native';
import config from '../config';

export interface Registration {
    token: string;
    securityCode: string;
}

let _authenticationToken = null;

export function nowLogout(): void {

    _authenticationToken = null;

}

export async function promptLogin(): Promise<string | Error | undefined> {
    
    // To sign up or log in, fill in your email address below:
    const email = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Email' });
    if (email) {
        const tokenName = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Token name' });
        if (tokenName) {
            const registration: Registration = await requestLogin(email, tokenName);
            if (registration) {
                await vscode.window.showInformationMessage(`We sent an email to ${email},\n\nVerify that the provided security code matches the following text: ${registration.securityCode}.\n\nClick OK when you have verified your email...`, { modal: true });
                const authenticationToken = await verifyLogin(email, registration.token);
                setAuthenticationToken(authenticationToken);
                return vscode.window.showInformationMessage('You have been correctly authenticated to Now.');
            }
        } else {
            throw new Error('Token name is required');
        }
    } else {
        throw new Error('Email is required');
    }

    return Promise.reject(new Error('An error has occurred'));

}

export function setAuthenticationToken(token: string) {
    _authenticationToken = token;
}

async function requestLogin(email: string, tokenName: string): Promise<Registration> {

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

async function verifyLogin(email: string, token: string): Promise<string> {

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
