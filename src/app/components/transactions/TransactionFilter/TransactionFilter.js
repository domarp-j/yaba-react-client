import React from 'react';
import PropTypes from 'prop-types';
import { Button, Segment, Form } from 'semantic-ui-react';
import { compose, reject } from 'ramda';
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
  modifyMatchAllTagsTransactionQuery,
  replaceTagNamesInTransactionQuery
} from '../../../store/actions/transactionQueries';
import { dateToMDY, dateToYMD, regexMDY } from '../../../utils/dateTools';

class TransactionFilter extends React.Component {
  FROM_DATE_CLEAVE = `${FROM_DATE}Cleave`;
  TO_DATE_CLEAVE = `${TO_DATE}Cleave`;

  dateTypeToCleave = {
    [FROM_DATE]: this.FROM_DATE_CLEAVE,
    [TO_DATE]: this.TO_DATE_CLEAVE,
  };

  initialFieldsState = {
    [FROM_DATE]: undefined,
    [TO_DATE]: undefined,
    description: '',
    tags: [],
  };

  static propTypes = {
    description: PropTypes.string,
    matchAllTags: PropTypes.bool,
    modifyDate: PropTypes.func,
    modifyDescription: PropTypes.func,
    modifyMatchAllTags: PropTypes.func,
    onCancel: PropTypes.func,
    replaceTagNames: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.string),
  };

  constructor() {
    super();
    this.state = {
      ...this.initialFieldsState,
      [this.FROM_DATE_CLEAVE]: undefined,
      [this.TO_DATE_CLEAVE]: undefined,
      matchAllTags: true,
      showAddTag: false,
    };
  }

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
  }

  resetFields = () => {
    this.setState(prevState => ({
      ...prevState,
      ...this.initialFieldsState,
    }));

    [FROM_DATE, TO_DATE].forEach(dateType => {
      this.state[this.dateTypeToCleave[dateType]]
        .setRawValue('');
    });
  }

  componentDidMount = () => {
    this.setState({
      [FROM_DATE]: dateToMDY(this.props[FROM_DATE]),
      [TO_DATE]: dateToMDY(this.props[TO_DATE]),
      description: this.props.description,
      tags: this.props.tags,
      matchAllTags: this.props.matchAllTags,
    });
  }

  setCleaveState = (cleave, dateType) => {
    this.setState({ [this.dateTypeToCleave[dateType]]: cleave });
  }

  handleDateChange = (e, dateType) => {
    this.setState({ [dateType]: e.target.value });
  }

  // TODO: Display alert for any scenario where this method returns false
  // TODO: Replace with a date picker?
  validDateInput = (date, dateType) => {
    // Empty date fields are automatically valid
    if (date === '') return true;

    // Ensure that an entered date is in MM/DD/YYYY format
    if (!date.match(regexMDY)) return false;

    // Ensure that from-date is before to-date
    if (dateType === FROM_DATE && this.state[TO_DATE]) {
      return moment(date) < moment(this.state[TO_DATE]);
    }
    if (dateType === TO_DATE && this.state[FROM_DATE]) {
      return moment(date) > moment(this.state[FROM_DATE]);
    }

    return true;
  }

  handleDescChange = e => {
    this.setState({
      description: e.target.value,
    });
  }

  handleDateBlur = (e, dateType) => {
    if (!this.validDateInput(e.target.value, dateType)) {
      this.setState(prevState => {
        prevState[this.dateTypeToCleave[dateType]].setRawValue('');
        return { [dateType]: '' };
      });
    }
  }

  handleAddTag = tag => {
    this.setState(prevState => ({
      tags: prevState.tags.concat(tag.tagName),
    }));
  }

  handleRemoveTag = removedTag => {
    this.setState(prevState => ({
      tags: reject(tag => tag === removedTag, prevState.tags),
    }));
  }

  handleFilterSubmit = () => {
    this.props.modifyDescription(this.state.description);
    this.props.modifyDate(FROM_DATE, dateToYMD(this.state[FROM_DATE]));
    this.props.modifyDate(TO_DATE, dateToYMD(this.state[TO_DATE]));
    this.props.modifyMatchAllTags(this.state.matchAllTags);
    this.props.replaceTagNames(this.state.tags);
    this.props.onCancel();
  }

  render() {
    const { onCancel } = this.props;
    const { description, matchAllTags, showAddTag, tags } = this.state;

    return (
      <Segment className='padding-30'>
        <h2>Filter transactions</h2>

        <h3>By description:</h3>
        <Form>
          <Form.Group>
            <Form.Input
              id='descriptionQuery'
              name='descriptionQuery'
              onChange={this.handleDescChange}
              value={description}
              width={9}
            />
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
                  onBlur={e => this.handleDateBlur(e, FROM_DATE)}
                  onChange={e => this.handleDateChange(e, FROM_DATE)}
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
                  onBlur={e => this.handleDateBlur(e, TO_DATE)}
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
              onDelete={() => this.handleRemoveTag(tag)}
              tagName={tag}
            />
          ))}

          {/* Input to add new tag */}
          {showAddTag &&
            <TagForm
              onCancel={() => this.toggleStateBool('showAddTag')}
              onSubmit={this.handleAddTag}
            />
          }

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
            onClick={() => this.setState({ matchAllTags: true })}
            positive={matchAllTags}
          >
            Match all tags
          </Button>
          <Button.Or />
          <Button
            onClick={() => this.setState({ matchAllTags: false })}
            positive={!matchAllTags}
          >
            Match any tag
          </Button>
        </Button.Group>

        <br />

        <div className='margin-top-30'>
          <Button
            className='full-width-mobile margin-top-10-mobile'
            color='blue'
            content='Filter'
            onClick={this.handleFilterSubmit}
            size='large'
          />

          <Button
            className='full-width-mobile margin-top-10-mobile'
            color='red'
            content='Clear'
            onClick={this.resetFields}
            size='large'
          />

          <Button
            className='full-width-mobile margin-top-10-mobile'
            content='Cancel'
            onClick={onCancel}
            size='large'
          />
        </div>
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
  modifyDate: (dateType, date) => dispatch(modifyDateForTransactionQuery(dateType, date)),
  modifyDescription: desc => dispatch(modifyDescriptionForTransactionQuery(desc)),
  modifyMatchAllTags: bool => dispatch(modifyMatchAllTagsTransactionQuery(bool)),
  replaceTagNames: tagNames => dispatch(replaceTagNamesInTransactionQuery(tagNames)),
});

export { TransactionFilter as BaseTransactionFilter };
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(TransactionFilter);
