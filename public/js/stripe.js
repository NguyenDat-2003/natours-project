// import { showAlert } from './alerts';
const stripe = Stripe(
    'pk_test_51OZvQMJkr6rwgTCtH6sVBfDhFVRiQXiMKXm2m6A26LG318bZ61PoRNxBiOxROE5qYNthZytGXJfe8wVtUMywqwMR00uwjWG3WD'
);

const bookTour = async (tourId) => {
    try {
        // 1) Get checkout session from API
        const session = await axios(
            `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
        );
        console.log(session);

        // 2) Create checkout form + chanre credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
    } catch (err) {
        console.log(err);
        // showAlert('error', err.response.message);
    }
};

export default bookTour;
