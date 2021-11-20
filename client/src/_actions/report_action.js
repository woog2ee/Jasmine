import axios from 'axios';
import { REPORT_LIST } from './types';

export function reportList(dataToSubmit) {
    const request = axios.get('/api/report/list', dataToSubmit).then((response) => response.data);

    return {
        type: REPORT_LIST,
        payload: request,
    };
}
