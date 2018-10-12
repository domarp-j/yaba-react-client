import React from 'react';
import PropTypes from 'prop-types';
import { Button, Segment, Form, Tab } from 'semantic-ui-react';
import { compose, reject } from 'ramda';
import { connect } from 'react-redux';
import Cleave from 'cleave.js/react';
import moment from 'moment';

import TagAdd from '../../tags/TagAdd';
import Tag from '../../tags/Tag';
import TagForm from '../../tags/TagForm';
import FilterText from '../FilterText';
import {
  FROM_DATE,
  TO_DATE,
  modifyDescriptionForTransactionQuery,
  modifyDateForTransactionQuery,
  modifyMatchAllTagsTransactionQuery,
  replaceTagNamesInTransactionQuery
} from '../../../store/actions/queries';
import { dateToMDY, dateToYMD, regexMDY } from '../../../utils/dateTools';

import './Filter.css';

class Filter extends React.Component {
  /*
    We will keep track of the initial state of all of our
      query fields.

    That will make it easier for us to reset the form when
      the user decides to clear out all of their current
      filter queries.
  */
  initialFieldsState = {
    [FROM_DATE]: '',
    [TO_DATE]: '',
    description: '',
    tags: [],
  };

  /*
    To properly handle what is displayed in the Cleave inputs,
      we need direct control of the Cleaves.

    Therefore, we must define our own custom Cleaves that we
      will save to state and mainpulate directly.
  */
  FROM_DATE_CLEAVE = `${FROM_DATE}Cleave`;
  TO_DATE_CLEAVE = `${TO_DATE}Cleave`;

  /*
    This is a quick & easy way to map a date type (FROM, TO)
      to it's respective cleave.
  */
  dateTypeToCleave = {
    [FROM_DATE]: this.FROM_DATE_CLEAVE,
    [TO_DATE]: this.TO_DATE_CLEAVE,
  };

  /*
    The user will be able to choose the filter type (description,
      date, tags, etc) by selecting a tab via the "Tab" Semantic UI
      component

    This object defines the panes for each tab, including the tab
      label and the rendered component when the tab is selected

    The "Tab" component itself, however, requires an array, so an
      ordered version of the panes has also been defined.
  */
  panes = {
    desc: {
      menuItem: 'By description',
      render: () => (
        <Tab.Pane as='div' className='margin-top-bottom-30'>
          {this.descriptionField()}
        </Tab.Pane>
      ),
    },
    dates: {
      menuItem: 'By date',
      render: () => (
        <Tab.Pane as='div' className='margin-top-bottom-30'>
          {this.dateFields()}
        </Tab.Pane>
      ),
    },
    tags: {
      menuItem: 'By tags',
      render: () => (
        <Tab.Pane as='div' className='margin-top-bottom-30'>
          {this.tagFields()}
        </Tab.Pane>
      ),
    },
  }
  paneList = [this.panes.desc, this.panes.dates, this.panes.tags]

  static propTypes = {
    description: PropTypes.string,
    matchAllTags: PropTypes.bool,
    modifyDate: PropTypes.func,
    modifyDescription: PropTypes.func,
    modifyMatchAllTags: PropTypes.func,
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
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
      showTagAdd: false,
      activeTab: this.paneList.indexOf(this.panes.desc),
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

    /*
      Reset the Cleave date fields by overriding their raw input values

      It is crucial that the dates tab is active when overriding the
        Cleave values. Otherwise, some buggy JS behavior could result.
    */
    if (this.state.activeTab === this.paneList.indexOf(this.panes.dates)) {
      this.state[this.dateTypeToCleave[FROM_DATE]].setRawValue('');
      this.state[this.dateTypeToCleave[TO_DATE]].setRawValue('');
    }
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

  descriptionField = () => (
    <div>
      <Form>
        <Form.Group>
          <Form.Input
            id='descriptionQuery'
            label='Description'
            name='descriptionQuery'
            onChange={this.handleDescChange}
            value={this.state.description}
            width={16}
          />
        </Form.Group>
      </Form>
    </div>
  )

  dateFields = () => (
    <div>
      <Form>
        <Form.Group>
          <Form.Field
            width={6}
          >
            <label htmlFor='date'>From</label>
            <div className='ui input'>
              <Cleave
                id='dateQueryFrom'
                name='dateQueryFrom'
                onBlur={e => this.handleDateBlur(e, FROM_DATE)}
                onChange={e => this.handleDateChange(e, FROM_DATE)}
                onInit={cleave => this.setCleaveState(cleave, FROM_DATE)}
                options={{
                  date: true, datePattern: ['m', 'd', 'Y'],
                }}
                value={this.state[FROM_DATE]}
              />
            </div>
          </Form.Field>

          <Form.Field
            className='margin-top-20-mobile'
            width={6}
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
                value={this.state[TO_DATE]}
              />
            </div>
          </Form.Field>
        </Form.Group>
      </Form>
    </div>
  )

  tagFields = () => {
    const { matchAllTags, showTagAdd, tags } = this.state;

    return (
      <div>
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
          {showTagAdd &&
            <TagForm
              onCancel={() => this.toggleStateBool('showTagAdd')}
              onSubmit={this.handleTagAdd}
            />
          }

          {/* Button that, when clicked, displays input to add new tag */}
          {!showTagAdd &&
            <TagAdd
              onClick={() => this.toggleStateBool('showTagAdd')}
            />
          }
        </div>

        <Button.Group
          className='margin-top-15'
          size='tiny'
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
      </div>
    );
  }

  setCleaveState = (cleave, dateType) => {
    this.setState({ [this.dateTypeToCleave[dateType]]: cleave });
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

  handleDateChange = (e, dateType) => {
    this.setState({ [dateType]: e.target.value });
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

  handleTagAdd = tag => {
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
    this.props.onSave();
  }

  render() {
    const { onCancel } = this.props;
    const { description, tags, [FROM_DATE]: fromDate, [TO_DATE]: toDate } = this.state;

    return (
      <Segment className='padding-30'>
        <h2>Filter transactions</h2>

        <Tab
          onTabChange={(e, data) => this.setState({ activeTab: data.activeIndex })}
          menu={{ borderless: true, pointing: true }}
          panes={this.paneList}
        />

        <p id='filter-text-modal' className='margin-top-15'>
          {(!description && !fromDate && !toDate && tags.length === 0) ?
            <span>Display <b>all</b> of my transactions</span> :
            <span>
              Display transactions {<FilterText
                tagNames={this.state.tags}
                {...this.state}
              />}
            </span>
          }
        </p>

        <br />

        <Button
          className='full-width-mobile'
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

export { Filter as BaseFilter };
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(Filter);
