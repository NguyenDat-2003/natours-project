import { showAlert } from './alerts.js';

const updateSettings = async (data) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: 'http://localhost:3000/api/v1/users/updateMe',
            data,
        });

        if (res.data.status === 'success')
            showAlert('success', 'Data upodated successfully!');
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export default updateSettings;
