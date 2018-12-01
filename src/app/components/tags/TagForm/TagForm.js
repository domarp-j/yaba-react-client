import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Input } from 'semantic-ui-react';
import { withFormik } from 'formik';
import * as yup from 'yup';
import { compose } from 'ramda';
import { connect } from 'react-redux';

import TagDropdown from '../TagDropdown';
import { fetchTags } from '../../../store/actions/tags';

class TagForm extends React.Component {
  static propTypes = {
    errors: PropTypes.shape({
      tagName: PropTypes.string,
    }),
    fetchTags: PropTypes.func,
    handleChange: PropTypes.func,
    handleSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
    setTouched: PropTypes.func,
    setValues: PropTypes.func,
    submitForm: PropTypes.func,
    tagId: PropTypes.number,
    tagOptions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })),
    touched: PropTypes.shape({
      tagName: PropTypes.bool,
    }),
    transactionId: PropTypes.number,
    values: PropTypes.shape({
      tagName: PropTypes.string,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      showDropdown: false,
    };
  }

  componentDidMount() {
    this.props.fetchTags();
  }

  showDropdown = () => {
    this.setState({ showDropdown: true });
  }

  hideDropdown = () => {
    this.setState({ showDropdown: false });
  }

  maskInputAndHandleChange = e => {
    if (!this.state.showDropdown) {
      this.showDropdown();
    }
    e.target.value = e.target.value.replace(/\s/, '');
    this.props.handleChange(e);
  };

  handleDropdownSelect = e => {
    this.hideDropdown();
    new Promise(resolve => {
      this.props.setValues({
        tagName: e.target.innerText,
      });
      resolve();
    }).then(() => {
      this.props.submitForm();
    });
  }

  submitTagForm = e => {
    e.persist();
    new Promise(resolve => {
      this.props.setTouched({ tagName: true });
      resolve();
    }).then(() => this.props.handleSubmit(e));
  };

  cancelTagForm = e => {
    e.preventDefault();
    this.props.onCancel();
  };

  render() {
    const {
      errors,
      tagOptions,
      touched,
      values,
    } = this.props;

    const { showDropdown } = this.state;

    return (
      <Input
        action
        className='tag-form'
        error={touched.tagName && !!errors.tagName}
        name='tagName'
        id='tagName'
        onChange={this.maskInputAndHandleChange}
        onFocus={this.showDropdown}
        placeholder='Add a tag...'
        type='text'
        value={values.tagName}
      >
        <input className='tag-form-input' />
        {showDropdown &&
          <TagDropdown
            className='tag-dropdown'
            filterText={values.tagName}
            onSelect={this.handleDropdownSelect}
            tags={tagOptions}
          />
        }
        <Button
          className='tag-save green-button'
          onClick={this.submitTagForm}
        >
          <Button.Content>
            <Icon name='checkmark' className='no-margin' />
          </Button.Content>
        </Button>
        <Button
          className='tag-cancel red-button margin-right-5'
          onClick={this.cancelTagForm}
        >
          <Button.Content>
            <Icon name='cancel' className='no-margin' />
          </Button.Content>
        </Button>
      </Input>
    );
  }
}

const schema = yup.object().shape({
  tagName: yup.string().required(),
});

const formikOptions = {
  handleSubmit: (values, { props }) => {
    props.onSave({
      oldTagName: props.initialValues && props.initialValues.tagName,
      tagId: props.tagId,
      tagName: values.tagName,
      transactionId: props.transactionId,
    });

    props.onCancel();
  },
  mapPropsToValues: props => ({
    tagName: props.initialValues && props.initialValues.tagName,
  }),
  validationSchema: schema,
};

const mapStateToProps = state => ({
  tagOptions: state.transactions.tags,
});

const mapDispatchToProps = dispatch => ({
  fetchTags: () => dispatch(fetchTags()),
});

export { TagForm as BaseTagForm };
export default compose(
  withFormik(formikOptions),
  connect(mapStateToProps, mapDispatchToProps)
)(TagForm);
