const BASE_URL = '/email';

const emailUrls = {
    verifyNotice: `${BASE_URL}/verify`,
    verify: (id, hash) => `${BASE_URL}/verify/${id}/${hash}`,
    resend: `${BASE_URL}/resend`,
};

export default emailUrls;
