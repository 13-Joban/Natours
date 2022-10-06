
/* eslint-disable */

const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY);


 const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    // console.log(err);
    showAlert('error', 'Try Again, Error in Booking Tour')
  }
};

// DOM ELEMENTS 
const bookTourbtn = document.getElementById('book-tour')


if(bookTourbtn){
    bookTourbtn.addEventListener('click', e => {
        e.target.textContent = 'Processing ...'
        const {tourId} = e.target.dataset;
        bookTour(tourId);
    });
}

