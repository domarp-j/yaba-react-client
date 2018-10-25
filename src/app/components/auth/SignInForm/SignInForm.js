import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Message } from 'semantic-ui-react';
import { withFormik } from 'formik';
import { compose } from 'ramda';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import * as yup from 'yup';

import { signInUser } from '../../../store/actions/reduxTokenAuth';
import { errorsList, allFieldsTouched, anyErrorsPresent, touchAllFields } from '../../../utils/formikTools';
import routes from '../../../routes';
import { configureAxios } from '../../../utils/yabaAxios';

const fields = ['email', 'password'];

const SignInForm = ({
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

      <Form.Field>
        <Button
          className='auth-button'
          disabled={allFieldsTouched(touched, fields) && anyErrorsPresent(errors)}
          content='Sign in'
          onClick={() => { setTouched(touchAllFields(fields)); }}
        />
      </Form.Field>

      <Message
        error
        visible={allFieldsTouched(touched, fields) && anyErrorsPresent(errors)}
        header='We ran into some errors while signing you in'
        list={errorsList(errors)}
      />
    </Form>
  );
};

SignInForm.propTypes = {
  errors: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
  }),
  handleBlur: PropTypes.func,
  handleChange: PropTypes.func,
  handleSubmit: PropTypes.func,
  setTouched: PropTypes.func,
  touched: PropTypes.shape({
    email: PropTypes.bool,
    password: PropTypes.bool,
  }),
  values: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
  }),
};

const schema = yup.object().shape({
  email: yup.string()
    .required('Your email address is required'),
  password: yup.string()
    .required('A password is required'),
});

const formikOptions = {
  handleSubmit: (
    values,
    {
      props,
      setErrors,
    }
  ) => {
    props.signInUser({ email: values.email, password: values.password })
      .then(() => {
        configureAxios().then(() => {
          props.history.push(routes.homePage);
        });
      })
      .catch(() => { setErrors({ saving: 'It looks like we could not sign you in. Please try again later.' }); });
  },
  validationSchema: schema,
};

const mapDispatchToProps = ({
  signInUser,
});

export { SignInForm as BaseSignInForm };
export default compose(
  connect(undefined, mapDispatchToProps),
  withRouter,
  withFormik(formikOptions)
)(SignInForm);
