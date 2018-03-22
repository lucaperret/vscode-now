
export default {
    URL: 'https://api.zeit.co',
    CONTENT_TYPE: {
        'Content-Type': 'application/json'
    },
    ENDPOINTS: {
        REGISTRATION: '/now/registration',
        VERIFY: '/now/registration/verify',
        DEPLOYMENTS: '/v2/now/deployments',
        ALIASES: '/v2/now/aliases',
        NEW_DEPLOYMENT: '/v3/now/deployments',
        UPLOAD_FILES: '/v2/now/files'
    }
};