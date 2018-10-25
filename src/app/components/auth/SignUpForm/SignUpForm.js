import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Message } from 'semantic-ui-react';
import { withFormik } from 'formik';
import { compose } from 'ramda';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import * as yup from 'yup';

import { registerUser } from '../../../store/actions/reduxTokenAuth';
import { errorsList, allFieldsTouched, anyErrorsPresent, touchAllFields } from '../../../utils/formikTools';
import routes from '../../../routes';

const fields = ['email', 'password', 'passwordConfirm'];

const SignUpForm = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSubmit,
  setTouched,
}) => {
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Input
        label='Email'
        type='email'
        name='email'
        id='email'
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.email}
        error={allFieldsTouched(touched, fields) && !!errors.email}
      />

      <Form.Input
        label='Password'
        type='password'
        name='password'
        id='password'
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.password}
        error={allFieldsTouched(touched, fields) && !!errors.password}
      />

      <Form.Input
        label='Password Confirmation'
        type='password'
        name='passwordConfirm'
        id='passwordConfirm'
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.passwordConfirm}
        error={allFieldsTouched(touched, fields) && !!errors.passwordConfirm}
      />

      <Form.Field>
        <Button
          className='auth-button'
          disabled={allFieldsTouched(touched, fields) && anyErrorsPresent(errors)}
          content='Sign up'
          onClick={() => { setTouched(touchAllFields(fields)); }}
        />
      </Form.Field>

      <Message
        error
        visible={allFieldsTouched(touched, fields) && anyErrorsPresent(errors)}
        header='We ran into some errors while signing you up'
        list={errorsList(errors)}
      />

    </Form>
  );
};

SignUpForm.propTypes = {
  errors: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
    passwordConfirm: PropTypes.string,
  }),
  handleBlur: PropTypes.func,
  handleChange: PropTypes.func,
  handleSubmit: PropTypes.func,
  setTouched: PropTypes.func,
  touched: PropTypes.shape({
    email: PropTypes.bool,
    password: PropTypes.bool,
    passwordConfirm: PropTypes.bool,
  }),
  values: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
    passwordConfirm: PropTypes.string,
  }),
};

const schema = yup.object().shape({
  email: yup.string()
    .required('An email address is required'),
  password: yup.string()
    .required('A password is required'),
  passwordConfirm: yup.mixed()
    .oneOf([yup.ref('password')], 'Your password confirmation must match your password')
    .required('A confirmation of your password is required'),
});

const formikOptions = {
  handleSubmit: (
    values,
    {
      props,
      setErrors,
    }
  ) => {
    props.registerUser({ email: values.email, password: values.password })
      .then(() => { props.history.push(routes.homePage); })
      .catch(() => { setErrors({ saving: 'It looks like we could not save your sign-up information. Please try again later.' }); });
  },
  validationSchema: schema,
};

const mapDispatchToProps = ({
  registerUser,
});

export { SignUpForm as BaseSignUpForm };
export default compose(
  connect(undefined, mapDispatchToProps),
  withRouter,
  withFormik(formikOptions)
)(SignUpForm);
