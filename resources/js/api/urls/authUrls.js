const BASE_URL = '/auth';

const authUrls = {
    register: `${BASE_URL}/register`,
    login: `${BASE_URL}/login`,
    logout: `${BASE_URL}/logout`,
    refreshToken: `${BASE_URL}/refresh-token`,

    oAuth2Redirect: (provider) => `/api${BASE_URL}/${provider}`,
};

export default authUrls;
