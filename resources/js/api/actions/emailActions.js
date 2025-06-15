import { emailUrls } from '@/api/urls';

const getVerificationNotice = () => window.axios.get(emailUrls.verifyNotice);
const verifyEmail = (id, hash) => window.axios.get(emailUrls.verify(id, hash));
const resendEmailVerification = () => window.axios.post(emailUrls.resend);

export default {
    getVerificationNotice,
    verifyEmail,
    resendEmailVerification,
};
