import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { postData } from '@src/config/apiConfig';
import { loginSuccess } from '@src/redux/reducer';
import validateForm from '@src/utils/validators';
import { ButtonSpinner } from '@src/components/common/LoadingSpinner.jsx';

const SignupForm = () => {
  const [signupForm, setSignupForm] = useState({ email: '', password: '', confirmPassword: '', verification: '', firstName: '', lastName: '' });
  const [step, setStep] = useState(1);
  const [apiResponse, setApiResponse] = useState({ otpSendMessage: null, otpVerifyMessage: null, signupMessage: null });
  const [validationError, setValidationError] = useState({});
  const [load, setLoad] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const signupFormInfo = [
    { name: 'email', type: 'email', required: true, message: 'Enter a valid email address' },
    { name: 'password', type: 'password', required: true, requiredLength: 8 },
    { name: 'confirmPassword', type: 'confirmPassword', required: true, requiredLength: 8 },
    { name: 'firstName', type: 'text', required: true, message: 'Enter your first name.' },
    { name: 'lastName', type: 'text', required: true, message: 'Enter your last name.' },
  ];

  const emailVerificationFormInfo = [{ name: 'email', type: 'email', required: true, message: 'Enter a valid email address' }];

  const emailCodeVerificationFormInfo = [
    { name: 'email', type: 'email', required: true, message: 'Enter a valid email address' },
    { name: 'verification', type: 'number', required: true, message: 'Please enter the valid verification code.' }
  ];

  const formValidation = (formInfo, loginForm) => {
    const validatedForm = validateForm(formInfo, loginForm);
    setValidationError(validatedForm?.isValid ? {} : validatedForm);
    return validatedForm?.isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupForm(prev => {
      const newFormState = {
        ...prev,
        [name]: value
      };
      if (validationError?.invalidFields?.includes(name)) {
        formValidation(signupFormInfo, newFormState);
      }
      return newFormState;
    });
  };

  const verifyCode = (e) => {
    e.preventDefault();
    const valid = formValidation(emailCodeVerificationFormInfo, signupForm);
    if (valid) {
      setLoad(true);
      postData('USER_EMAIL_VERIFY', { baseURL: 'userAuth', data: { email: signupForm.email, otp: Number(signupForm.verification) } })
        .then(response => {
          setLoad(false);
          if (response.status === 'success') {
            setStep(3);
            setApiResponse(prev => ({ ...prev, otpVerifyMessage: response?.message, otpVerifyMessage: null }));
          }
        })
        .catch(err => setApiResponse(prev => ({ ...prev, otpVerifyMessage: err.message, otpSendMessage: null })))
        .finally(() => setLoad(false));
    };
  };

  const sendVerification = (e) => {
    e.preventDefault();
    const valid = formValidation(emailVerificationFormInfo, signupForm);
    if (valid) {
      setLoad(true);
      postData('USER_EMAIL_REG', { baseURL: 'userAuth', data: { email: signupForm.email } })
        .then(response => {
          setLoad(false);
          if (response.status === 204) {
            setStep(3);
            setApiResponse(prev => ({ ...prev, otpSendMessage: 'Email already verified', otpVerifyMessage: null }));
          } else if (response.status === 'success') {
            setStep(2);
            setApiResponse(prev => ({ ...prev, otpSendMessage: response?.message, otpVerifyMessage: null }));
          }
        })
        .catch(err => setApiResponse(prev => ({ ...prev, otpVerifyMessage: err.message, otpSendMessage: null })))
        .finally(() => setLoad(false));
    };
  };

  const signUp = (e) => {
    e.preventDefault();
    const valid = formValidation(signupFormInfo, signupForm);
    if (valid) {
      setLoad(true);
      const { email, password, confirmPassword: passwordConfirm, firstName, lastName } = signupForm;
      postData('USER_SIGNUP', {
        baseURL: 'userAuth',
        data: { email, password, passwordConfirm, firstName, lastName }
      })
        .then(response => {
          dispatch(loginSuccess({ token: response.token, user: response.data.user }));
          navigate('/additionalinfo');
        })
        .catch(err => {
          setApiResponse(prev => ({ ...prev, signupMessage: err?.message }));
        })
        .finally(() => setLoad(false));
    }
  };

  return (
    <div className='auth_form signup_form'>
      {step === 1 && <form autoComplete="off" noValidate>
        <div>
          <label className='w-100 mt-2' htmlFor='send-code-email'>Email Address</label>
          <input
            className={`w-100 ${validationError?.invalidFields?.includes('email') ? 'wrongInput' : validationError?.validFields?.includes('email') ? 'rightInput' : ''}`}
            autoComplete="new-email"
            id='send-code-email'
            type="email"
            name="email"
            value={signupForm.email}
            onChange={e => {
              const { name, value } = e.target;
              setSignupForm(prev => {
                const newFormState = {
                  ...prev,
                  [name]: value
                };

                if (validationError?.invalidFields?.includes(name)) {
                  formValidation(emailVerificationFormInfo, newFormState);
                }
                return newFormState;
              });
            }}
          />
          <span>{validationError?.errors?.email}</span>
        </div>
        <div className='w-full'>
          <span className='text-danger'>{apiResponse?.otpSendMessage}</span>
        </div>
        <button className='mt-4 btn' onClick={sendVerification} disabled={load}>
          <ButtonSpinner load={load} />
          Verify Email
        </button>
      </form>}
      {step === 2 && <form autoComplete="off" noValidate>
        <div>
          <label className='w-100 mt-2' htmlFor='verify-code-email'>Email Address</label>
          <input
            className='w-100'
            autoComplete="new-email"
            id='verify-code-email'
            type="email"
            name="email"
            value={signupForm.email}
            disabled={true}
          />
        </div>
        <div>
          <label className='w-100 mt-2' htmlFor='signup-verification'>Verification Code</label>
          <input
            className={`w-100 ${validationError?.invalidFields?.includes('verification') ? 'wrongInput' : validationError?.validFields?.includes('verification') ? 'rightInput' : ''}`}
            autoComplete="new-number"
            id='signup-verification'
            type="number"
            name="verification"
            onKeyDown={(e) => {
              if (['e', 'E', '-', '+', '.'].includes(e.key)) {
                e.preventDefault();
              }
            }}
            value={signupForm.verification}
            onChange={e => {
              setApiResponse(prev => ({ ...prev, otpVerifyMessage: null }));
              const { name, value } = e.target;
              setSignupForm(prev => {
                const newFormState = {
                  ...prev,
                  [name]: value
                };
                if (validationError?.invalidFields?.includes(name)) {
                  formValidation(emailCodeVerificationFormInfo, newFormState);
                }
                return newFormState;
              });
            }}
          />
          <span>{validationError?.errors?.verification}</span>
        </div>
        <div className='w-full'>
          {apiResponse?.otpSendMessage ?
            <span className='text-success'>{apiResponse?.otpSendMessage}</span>
            :
            <span className='text-danger'>{apiResponse?.otpVerifyMessage}</span>
          }
        </div>
        <div className='d-flex w-100 gap-4 '>
          <button className='mt-4 w-auto px-4 btn position-relative' onClick={verifyCode} disabled={load}>
            Verify
            <ButtonSpinner load={load} />
          </button>
          {apiResponse?.otpVerifyMessage && <button className='mt-4 w-auto px-4 btn' onClick={sendVerification} disabled={load}>
            Send Code
          </button>}
        </div>
      </form>}
      {step === 3 && <form onSubmit={signUp} autoComplete="off" noValidate>
        <div>
          <label className='w-100 mt-2' htmlFor='signup-email'>Email Address</label>
          <input
            className='w-100'
            autoComplete="new-email"
            id='signup-email'
            type="email"
            name="email"
            value={signupForm.email}
            disabled={true}
          />
        </div>
        <div>
          <label className='w-100 mt-2' htmlFor='signup-firstName'>First Name</label>
          <input
            className={`w-100 ${validationError?.invalidFields?.includes('firstName') ? 'wrongInput' : validationError?.validFields?.includes('firstName') ? 'rightInput' : ''}`}
            id='signup-firstName'
            type="text"
            name="firstName"
            value={signupForm.firstName}
            onChange={handleChange}
            autoComplete="new-text"
          />
          <span>{validationError?.errors?.firstName}</span>
        </div>
        <div>
          <label className='w-100 mt-2' htmlFor='signup-lastName'>Last Name</label>
          <input
            className={`w-100 ${validationError?.invalidFields?.includes('lastName') ? 'wrongInput' : validationError?.validFields?.includes('lastName') ? 'rightInput' : ''}`}
            autoComplete="new-text"
            id='signup-lastName'
            type="text"
            name="lastName"
            value={signupForm.lastName}
            onChange={handleChange}
          />
          <span>{validationError?.errors?.lastName}</span>
        </div>
        <div>
          <label className='w-100 mt-2' htmlFor='signup-password'>Password</label>
          <input
            className={`w-100 ${validationError?.invalidFields?.includes('password') ? 'wrongInput' : validationError?.validFields?.includes('password') ? 'rightInput' : ''}`}
            autoComplete="new-password"
            id='signup-password'
            type="password"
            name="password"
            value={signupForm.password}
            onChange={handleChange}
          />
          <div className='password_requirements'>
            <span className={`${validationError?.invalidFields?.includes('password') ? 'text-danger' : validationError?.validFields?.includes('password') ? 'text-success' : 'd-none'} ${validationError?.validFields?.includes('password') && 'text-success'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135 100" shapeRendering="geometricPrecision" textRendering="geometricPrecision">
                <path d="M120.004 3.341 45.596 81.632l-29.5-24.655c-6.003-5.043-7.852-4.46-12.402 0-4.83 5.489-5.02 7.42 0 12.199s33.703 27.987 33.703 27.987c2.526 1.847 5.102 2.842 8.199 2.842 3.092 0 5.865-.79 8.229-2.842l77.78-82.114c4.523-4.47 4.544-7.265 0-11.708-4.55-4.443-7.078-4.454-11.6 0" fill="currentColor " fillRule="evenodd" />
              </svg>
              {validationError?.errors?.password}
            </span>
          </div>
        </div>
        <div>
          <label className='w-100 mt-2' htmlFor='signup=confirm-password'>Confirm Password</label>
          <input
            className={`w-100 ${validationError?.invalidFields?.includes('confirmPassword') ? 'wrongInput' : validationError?.validFields?.includes('confirmPassword') ? 'rightInput' : ''}`}
            autoComplete="new-password"
            id='signup=confirm-password'
            type="password"
            name="confirmPassword"
            value={signupForm.confirmPassword}
            onChange={handleChange}
          />
          <span>{validationError?.errors?.confirmPassword}</span>
        </div>
        <div className='w-full'>
          <span className='text-danger'>{apiResponse?.signupMessage}</span>
        </div>
        <button className='mt-4 btn' type="submit" disabled={load}>
          <ButtonSpinner load={load} />
          Signup
        </button>
      </form >}
    </div >
  );
};

export default SignupForm;