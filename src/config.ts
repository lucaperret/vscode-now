
export default {
    URL: 'https://api.zeit.co',
    CONTENT_TYPE: {
        'Content-Type': 'application/json'
    },
    AUTHORIZATION: {
        Authorization: 'Bearer'
    },
    ENDPOINTS: {
        REGISTRATION: '/now/registration',
        VERIFY: '/now/registration/verify',
        DEPLOYMENTS: '/v2/now/deployments'
    }
};