import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Form } from 'semantic-ui-react';
import { compose } from 'ramda';
import { connect } from 'react-redux';
import Cleave from 'cleave.js/react';
import moment from 'moment';

import AddTag from '../../tags/AddTag';
import Tag from '../../tags/Tag';
import TagForm from '../../tags/TagForm';
import {
  FROM_DATE,
  TO_DATE,
  addTagNameToTransactionQuery,
  removeTagNameFromTransactionQuery,
  modifyDateForTransactionQuery
} from '../../../store/actions/transactionQueries';
import { dateToMDY, dateToYMD, regexMDY } from '../../../utils/dateTools';

class TransactionFilter extends React.Component {
  FROM_DATE_CLEAVE = `${FROM_DATE}Cleave`;
  TO_DATE_CLEAVE = `${TO_DATE}Cleave`;

  dateTypeToCleave = {
    [FROM_DATE]: this.FROM_DATE_CLEAVE,
    [TO_DATE]: this.TO_DATE_CLEAVE,
  };

  static propTypes = {
    addTag: PropTypes.func,
    modifyDate: PropTypes.func,
    removeTag: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.string),
  };

  constructor() {
    super();
    this.state = {
      [FROM_DATE]: '',
      [TO_DATE]: '',
      [this.FROM_DATE_CLEAVE]: null,
      [this.TO_DATE_CLEAVE]: null,
      showAddTag: false,
    };
  }

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
  }

  setCleaveState = (cleave, dateType) => {
    this.setState({ [this.dateTypeToCleave[dateType]]: cleave });
  }

  onDateChange = (e, dateType) => {
    this.setState({ [dateType]: e.target.value });
  }

  // TODO: Display alert for any scenario where this method returns false
  validDateInput = (date, dateType) => {
    // Empty date fields are automatically valid
    if (date === '') return true;

    // Ensure that an entered date is in MM/DD/YYYY format
    if (!date.match(regexMDY)) return false;

    // Ensure that from-date is before to-date
    if (dateType === FROM_DATE && this.props[TO_DATE]) {
      return moment(date) < moment(this.props[TO_DATE]);
    }
    if (dateType === TO_DATE && this.props[FROM_DATE]) {
      return moment(date) > moment(this.props[FROM_DATE]);
    }

    return true;
  }

  updateDateQuery = (e, dateType) => {
    if (this.validDateInput(e.target.value, dateType)) {
      this.props.modifyDate(
        dateType,
        dateToYMD(e.target.value)
      );
    } else {
      this.state[this.dateTypeToCleave[dateType]].setRawValue(this.props[dateType]);
      this.props.modifyDate(dateType, dateToYMD(this.props[dateType]));
    }
  }

  render() {
    const { addTag, removeTag, tags } = this.props;
    const { showAddTag } = this.state;

    return (
      <Segment basic>
        <h2>Filter transactions</h2>

        <h3>By tag:</h3>
        <div>
          {/* Transaction query tags */}
          {tags && tags.length > 0 && tags.map(tag => (
            <Tag
              key={`query-tag-${tag}`}
              onDelete={() => (
                removeTag(tag)
              )}
              tagName={tag}
            />
          ))}

          {/* Input to add new tag */}
          {showAddTag &&
            <TagForm
              onCancel={() => this.toggleStateBool('showAddTag')}
              onSubmit={addTag}
            />
          }

          {/* TODO: Loader that shows while add-tag call is being processed */}
          {/* isAddingTag && <Button className='tag-loader' loading /> */}

          {/* Button that, when clicked, displays input to add new tag */}
          {!showAddTag &&
            <AddTag
              onClick={() => this.toggleStateBool('showAddTag')}
            />
          }

          <h3>By date:</h3>
          <Form onSubmit={this.setValuesAndSubmit}>
            <Form.Group>
              <Form.Field
                width={3}
              >
                <label htmlFor='date'>From</label>
                <div className='ui input'>
                  <Cleave
                    id='dateQueryFrom'
                    name='dateQueryFrom'
                    onBlur={e => this.updateDateQuery(e, FROM_DATE)}
                    onChange={e => this.onDateChange(e, FROM_DATE)}
                    onInit={cleave =>  this.setCleaveState(cleave, FROM_DATE)}
                    options={{
                      date: true, datePattern: ['m', 'd', 'Y'],
                    }}
                    value={this.props[FROM_DATE] || this.state[FROM_DATE]}
                  />
                </div>
              </Form.Field>

              <Form.Field
                width={3}
              >
                <label htmlFor='date'>To</label>
                <div className='ui input'>
                  <Cleave
                    id='dateQueryTo'
                    name='dateQueryTo'
                    onBlur={e => this.updateDateQuery(e, TO_DATE)}
                    onChange={e => this.setState({ [TO_DATE]: e.target.value })}
                    onInit={cleave => this.setCleaveState(cleave, TO_DATE)}
                    options={{
                      date: true, datePattern: ['m', 'd', 'Y'],
                    }}
                    value={this.props[TO_DATE] || this.state[TO_DATE]}
                  />
                </div>
              </Form.Field>
            </Form.Group>
          </Form>
        </div>
      </Segment>
    );
  }
}

const mapStateToProps = state => ({
  tags: state.transactions.queries.tagNames,
  [FROM_DATE]: dateToMDY(state.transactions.queries.fromDate),
  [TO_DATE]: dateToMDY(state.transactions.queries.toDate),
});

const mapDispatchToProps = dispatch => ({
  addTag: tagName => dispatch(addTagNameToTransactionQuery(tagName)),
  removeTag: tagName => dispatch(removeTagNameFromTransactionQuery(tagName)),
  modifyDate: (dateType, date) => dispatch(modifyDateForTransactionQuery(dateType, date)),
});

export { TransactionFilter as BaseTransactionFilter };
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(TransactionFilter);
