const BASE_URL = '/reports';

const reportUrls = {
    index: `${BASE_URL}`,
    store: `${BASE_URL}`,
    destroy: (reportId) => `${BASE_URL}/${reportId}`,
};

export default reportUrls;
