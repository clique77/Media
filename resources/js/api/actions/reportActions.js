import { reportUrls } from '@/api/urls';

const getReports = () => window.axios.get(reportUrls.index);
const createReport = (payload) => window.axios.post(reportUrls.store, payload);
const deleteReport = (reportId) => window.axios.delete(reportUrls.destroy(reportId));

export default {
    getReports,
    createReport,
    deleteReport,
};
