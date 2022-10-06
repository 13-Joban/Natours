
// type is 'success' or 'error'
// const showAlert = (type, msg) => {
//     hideAlert();
//     const markup = `<div class="alert alert--${type}">${msg}</div>`;
//     document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
//     window.setTimeout(hideAlert, 1000);
//   };


const updateSettings = async (data, type) => {
    try {
      const url =
        type === 'password'
          ? '/api/v1/users/updateMyPassword'
          : '/api/v1/users/updateMe';
  
      const res = await axios({
        method: 'PATCH',
        url,
        data
      });
  
      if (res.data.status === 'success') {
        showAlert('success', `${type.toUpperCase()} updated successfully!`);
      }
    } catch (err) {
        // console.log(err);
      showAlert('error', err.response.data.message);
    }
  };

// update User data
const userDataform = document.querySelector('.form-user-data');
if(userDataform){
  userDataform.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // console.log(form);

    updateSettings(form, 'data');
  });
}

// update Password
const userPasswordForm = document.querySelector('.form-user-password');
if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
  
    await updateSettings(
      { currentPassword, newPassword, confirmPassword },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
