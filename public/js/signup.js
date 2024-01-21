import { showAlert } from './alerts.js';

const signup = async (name, email, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:3000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm,
            },
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Sign in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        }
    } catch (err) {
        showAlert('error', err.response);
    }
};

export default signup;
