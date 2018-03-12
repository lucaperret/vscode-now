import * as vscode from 'vscode';
import { setAuthenticationToken, requestLogin, verifyLogin, Registration } from '../utils/authentication';

export function logout (): void {
    setAuthenticationToken(null);
    vscode.window.showInformationMessage('You have been correctly logout to Now.');
}

export async function login (): Promise<string | Error | undefined> {
    const email = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Email' });
    if (email) {
        const tokenName = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Token name' });
        if (tokenName) {
            const registration: Registration = await requestLogin(email, tokenName);
            if (registration) {
                await vscode.window.showInformationMessage(`We sent an email to ${email},\n\nVerify that the provided security code matches the following text: ${registration.securityCode}.\n\nClick OK when you have verified your email...`, { modal: true });
                const authenticationToken = await verifyLogin(email, registration.token);
                setAuthenticationToken(authenticationToken);
                vscode.window.showInformationMessage('You have been correctly authenticated to Now.');
                return Promise.resolve(authenticationToken);
            }
        } else {
            throw new Error('Token name is required');
        }
    } else {
        throw new Error('Email is required');
    }

    return Promise.reject(new Error('An error has occurred'));
}

export async function setToken (): Promise<string | Error | undefined> {
    const token = await vscode.window.showInputBox({ ignoreFocusOut: true, password: true, prompt: 'Token' });
    if (token) {
        setAuthenticationToken(token);
        vscode.window.showInformationMessage('You have been correctly authenticated to Now.');
        return Promise.resolve(token);
    }

    return Promise.reject(new Error('An error has occurred'));
}