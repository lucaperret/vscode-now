import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as globby from 'globby';
import * as hasha from 'hasha';
import * as ignoreToArray from 'parse-gitignore';
import config from '../config';
import { request, requireFile, mayBeRead, absoluteToRelative } from './common';
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

export enum DeploymentTypeType {
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
    type: DeploymentTypeType;
    scale: Scale | undefined;
    creator: Creator;
}

interface Scale {
    current: number;
    min: number;
    max: number;
}

export async function createDeployment (progress: vscode.Progress<{ message?: string; }>, folder: string, name: string, deploymentType: DeploymentTypeType) {
    const nowConfig = requireFile(path.resolve(folder, 'now.json'));
    let whitelist = nowConfig.files;
    const files = [];
    let globbyPatterns = ['*/**'];
    const globbyOptions = {
        cwd: folder,
        absolute: true,
        ignore: ['.hg', '.git', '.gitmodules', '.svn', '.npmignore', '.dockerignore', '.gitignore', '.*.swp', '.DS_Store', '.wafpicke-*', '.lock-wscript', 'npm-debug.log', 'config.gypi', 'node_modules', 'CVS'],
        gitignore: false
    };
    if (deploymentType === DeploymentTypeType.NPM) {
        const pkg = requireFile(path.resolve(folder, 'package.json'));
        whitelist = whitelist || pkg.files || (pkg.now && pkg.now.files);
        if (!whitelist) {
            const npmIgnore = mayBeRead(path.resolve(folder, '.npmignore'));
            if (npmIgnore) {
                globbyOptions.ignore.push(...ignoreToArray(npmIgnore));
            } else {
                globbyOptions.gitignore = true;
            }
        }
        globbyOptions.ignore.push('package.json');
        files.push(path.resolve(folder, 'package.json'));
    } else if (deploymentType === DeploymentTypeType.DOCKER) {
        if (!whitelist) {
            const dockerIgnore = mayBeRead(path.resolve(folder, '.dockerignore'));
            if (dockerIgnore) {
                globbyOptions.ignore.push(...ignoreToArray(dockerIgnore));
            } else {
                globbyOptions.gitignore = true;
            }
        }
        globbyOptions.ignore.push('Dockerfile');
        files.push(path.resolve(folder, 'Dockerfile'));
    } else if (deploymentType === DeploymentTypeType.STATIC) {
        if (!whitelist) {
            globbyOptions.ignore.push(...['now.json', 'package.json', 'Dockerfile']);
            globbyOptions.gitignore = true;
        }
    }
    if (whitelist) {
        globbyPatterns.push(...whitelist);
    }

    files.push(...(await globby(globbyPatterns, globbyOptions)));

    const filesInfo = await Promise.all(files.map(async file => {
        return {
            file,
            sha: await hasha.fromFile(file, {
                encoding: 'hex',
                algorithm: 'sha1'
            }),
            size: fs.statSync(file).size
        };
    }));
    for (const file of filesInfo) {
        progress.report({ message: `Uploading ${absoluteToRelative(folder, file.file)}...` });
        await request('POST', config.ENDPOINTS.UPLOAD_FILES, true, fs.readFileSync(file.file, 'utf8'), null, {
            'Content-Type': 'application/octet-stream',
			'x-now-digest': file.sha,
            'x-now-size': file.size,
            'Content-Length': file.size
        });
    }
    progress.report({ message: 'Creation of the deployment...' });
    const response = await request('POST', config.ENDPOINTS.NEW_DEPLOYMENT, true, {
        public: false,
        name,
        deploymentType,
        files: filesInfo.map(file => ({
            file: absoluteToRelative(folder, file.file),
            sha: file.sha,
            size: file.size
        }))
    });
    return response.url;
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