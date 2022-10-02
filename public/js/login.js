
 const login = async (email, password) => {
  try {
    const res = await  axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {email, password}
    })
    if(res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/')
      }, 700);
    }
    
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
}
 const loginForm = document.querySelector('.form--login');
if (loginForm)
  loginForm.addEventListener('submit', el => {
    el.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
  
const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 1000);
};
const logout = async () => {
  try {
    const res = await   axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    })
    if(res.data.status === 'success') {
    location.reload(true);
    }
    
  } catch (error) { 
    showAlert('error', 'Error in logging Out, Try again');
  }
}
const logOutBtn = document.querySelector('.nav__el--logout');
if (logOutBtn){
  logOutBtn.addEventListener('click', logout);
}
  