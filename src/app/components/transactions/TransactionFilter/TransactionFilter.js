import React from 'react';
import PropTypes from 'prop-types';
import { Button, Segment, Form } from 'semantic-ui-react';
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
  modifyDescriptionForTransactionQuery,
  modifyDateForTransactionQuery,
  addTagNameToTransactionQuery,
  removeTagNameFromTransactionQuery,
  modifyMatchAllTagsTransactionQuery
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
    description: PropTypes.string,
    matchAllTags: PropTypes.bool,
    modifyDate: PropTypes.func,
    modifyDescription: PropTypes.func,
    modifyMatchAllTags: PropTypes.func,
    removeTag: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.string),
  };

  constructor() {
    super();
    this.state = {
      [FROM_DATE]: undefined,
      [TO_DATE]: undefined,
      [this.FROM_DATE_CLEAVE]: undefined,
      [this.TO_DATE_CLEAVE]: undefined,
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

  updateDescriptionQuery = e => {
    this.props.modifyDescription(e.target.value);
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
    const {
      addTag,
      description,
      matchAllTags,
      modifyMatchAllTags,
      removeTag,
      tags,
    } = this.props;

    const { showAddTag } = this.state;

    return (
      <Segment basic>
        <h2>Filter transactions</h2>

        <h3>By description:</h3>
        <Form>
          <Form.Group>
            <Form.Field
              width={9}
            >
              <div className='ui input'>
                <Cleave
                  id='descriptionQuery'
                  name='descriptionQuery'
                  onBlur={this.updateDescriptionQuery}
                  value={description}
                />
              </div>
            </Form.Field>
          </Form.Group>
        </Form>

        <h3>By date:</h3>
        <Form>
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
              className='margin-top-20-mobile'
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
          {/* addingTag && <Button className='tag-loader' loading /> */}

          {/* Button that, when clicked, displays input to add new tag */}
          {!showAddTag &&
              <AddTag
                onClick={() => this.toggleStateBool('showAddTag')}
              />
          }
        </div>
        <Button.Group
          className='margin-top-15'
          size='small'
        >
          <Button
            onClick={() => modifyMatchAllTags(true)}
            positive={matchAllTags}
          >
            Match all tags
          </Button>
          <Button.Or />
          <Button
            onClick={() => modifyMatchAllTags(false)}
            positive={!matchAllTags}
          >
            Match any tag
          </Button>
        </Button.Group>
      </Segment>
    );
  }
}

const mapStateToProps = state => ({
  [FROM_DATE]: dateToMDY(state.transactions.queries.fromDate),
  [TO_DATE]: dateToMDY(state.transactions.queries.toDate),
  description: state.transactions.queries.description,
  matchAllTags: state.transactions.queries.matchAllTags,
  tags: state.transactions.queries.tagNames,
});

const mapDispatchToProps = dispatch => ({
  addTag: tagName => dispatch(addTagNameToTransactionQuery(tagName)),
  removeTag: tagName => dispatch(removeTagNameFromTransactionQuery(tagName)),
  modifyDate: (dateType, date) => dispatch(modifyDateForTransactionQuery(dateType, date)),
  modifyDescription: desc => dispatch(modifyDescriptionForTransactionQuery(desc)),
  modifyMatchAllTags: bool => dispatch(modifyMatchAllTagsTransactionQuery(bool)),
});

export { TransactionFilter as BaseTransactionFilter };
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(TransactionFilter);
