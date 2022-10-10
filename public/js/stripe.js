
/* eslint-disable */

const stripe = Stripe('pk_test_51LpQ5SSAREguZ4UW1wKZrj4A5BwBkF3oE3i61NiEy7O9MfbboqDQWQL8Kvbd0qHZ5lHpyYni6qu0OvFPFNULjdEk00S2xENUug');


 const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `https://hidden-fortress-89648.herokuapp.com/api/v1/bookings/checkout-session/${tourId}`
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

