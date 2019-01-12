import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Segment, Tab } from 'semantic-ui-react';
import { compose } from 'ramda';
import { connect } from 'react-redux';
import moment from 'moment';

import { DatePicker, Popup } from '../../misc';
import { FilterText } from '../../transactions';
import {
  FROM_DATE,
  TO_DATE,
  modifyDescriptionForTransactionQuery,
  modifyDateForTransactionQuery,
  modifyMatchAllTagsTransactionQuery,
  replaceTagNamesInTransactionQuery
} from '../../../store/actions/queries';
import { dateToMDY, dateToYMD, regexMDY } from '../../../utils/dateTools';
import { extractTags } from '../../../utils/tagTools';

class Filter extends React.Component {
  /**
   * Initial state for all transaction query fields
   * Useful when the queries need to be reset to a "blank", initial state
   */
  initialFieldsState = {
    [FROM_DATE]: '',
    [TO_DATE]: '',
    description: '',
    tags: [],
  };

  /**
   * Each filter "page" will be behind a tab pane
   * The Tab component is provided by Semantic UI React
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

  /**
   * The date filter page will have date query "shortcuts", i.e.
   * past week, last 30 days, etc.
   *
   * This array of objects dictates the text & fromDate for each
   * of these date shortcut buttons.
   */
  dateQueryShortcuts = [
    { text: 'since last sunday', fromDate: moment().day(0)._d },
    { text: 'past seven days', fromDate: moment().subtract(7, 'days')._d },
    { text: 'this month', fromDate: moment().date(1)._d },
    { text: 'past thirty days', fromDate: moment().subtract(30, 'days')._d },
    {
      text: 'this quarter',
      fromDate: (() => {
        let monthAndDay;
        switch(moment().quarter()) {
        case 1: monthAndDay = 'January 1'; break;
        case 2: monthAndDay = 'April 1'; break;
        case 3: monthAndDay = 'July 1'; break;
        case 4: monthAndDay = 'October 1'; break;
        }
        return moment(monthAndDay).year(moment().year())._d;
      })(),
    },
    { text: 'past three months', fromDate: moment().subtract(3, 'months')._d },
    { text: 'this year', fromDate: moment().dayOfYear(1)._d },
    { text: 'past year', fromDate: moment().subtract(1, 'years')._d },
  ]

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

  constructor(props) {
    super(props);
    this.state = {
      ...this.initialFieldsState,
      activeTab: this.paneList.indexOf(this.panes.desc),
      matchAllTags: true,
      tagInput: '',
    };
  }

  componentDidMount = () => {
    this.setState({
      [FROM_DATE]: dateToMDY(this.props[FROM_DATE]),
      [TO_DATE]: dateToMDY(this.props[TO_DATE]),
      description: this.props.description,
      tagInput: this.props.tags.map(tag => `#${tag}`).join(' '),
      tags: this.props.tags,
      matchAllTags: this.props.matchAllTags,
    });
  }

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
  }

  DateQuery = ({ fromDate, text }) => (
    <Button
      className='margin-bottom-5 padding-5'
      onClick={() => {
        this.setState({
          [TO_DATE]: undefined,
        }, () => {
          this.handleDateChange(fromDate, FROM_DATE);
        });
      }}
    >
      {text}
    </Button>
  )

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

  dateFields = () => {
    const style = { padding: '0', zIndex: 1001 };
    const DateQuery = this.DateQuery;

    return (
      <Form>
        <Form.Group>
          <Popup
            content={<DatePicker
              month={this.state[FROM_DATE] ? new Date(this.state[FROM_DATE]) : null}
              onDayClick={day => this.handleDateChange(day, FROM_DATE)}
              showClose={false}
            />}
            position='bottom left'
            style={style}
            trigger={<Form.Input
              className='date-field'
              id='dateQueryFrom'
              label='From'
              name='dateQueryFrom'
              readOnly
              value={(this.state[FROM_DATE] && dateToMDY(this.state[FROM_DATE])) || 'MM/DD/YYYY'}
              width={6}
            />}
          />

          <Popup
            content={<DatePicker
              month={this.state[TO_DATE] ? new Date(this.state[TO_DATE]) : null}
              onDayClick={day => this.handleDateChange(day, TO_DATE)}
              showClose={false}
            />}
            position='bottom left'
            style={style}
            trigger={<Form.Input
              className='margin-top-20-mobile date-field'
              id='dateQueryTo'
              label='To'
              name='dateQueryTo'
              readOnly
              value={(this.state[TO_DATE] && dateToMDY(this.state[TO_DATE])) || 'MM/DD/YYYY'}
              width={6}
            />}
          />
        </Form.Group>

        <div className='margin-top-20-mobile'>
          {this.dateQueryShortcuts.map(dqs => (
            <DateQuery
              fromDate={dqs.fromDate}
              key={dqs.text}
              text={dqs.text}
            />
          ))}
        </div>
      </Form>
    );
  }

  tagFields = () => (
    <div>
      <Form>
        <Form.Group>
          <Form.Field
            width={16}
          >
            <label htmlFor='tags'>Tags <span>(i.e. #food and #travel)</span></label>
            <Form.Input
              onChange={this.handleTagsChange}
            />
          </Form.Field>
        </Form.Group>
      </Form>

      <Button.Group
        className='margin-top-15'
        size='tiny'
      >
        <Button
          onClick={() => this.setState({ matchAllTags: true })}
          positive={this.state.matchAllTags}
        >
            Match all tags
        </Button>
        <Button.Or />
        <Button
          onClick={() => this.setState({ matchAllTags: false })}
          positive={!this.state.matchAllTags}
        >
            Match any tag
        </Button>
      </Button.Group>
    </div>
  )

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

  handleDateChange = (day, dateType) => {
    const dateMDY = dateToMDY(day);
    if (this.validDateInput(dateMDY, dateType)) {
      this.setState({
        [dateType]: dateMDY,
      });
    }
  }

  handleDescChange = e => {
    this.setState({
      description: e.target.value,
    });
  }

  handleTagsChange = event => {
    this.setState({
      tagInput: event.target.value,
      tags: extractTags(event.target.value),
    });
  }

  handleFilterSubmit = () => {
    this.props.modifyDescription(this.state.description);
    this.props.modifyDate(FROM_DATE, dateToYMD(this.state[FROM_DATE]));
    this.props.modifyDate(TO_DATE, dateToYMD(this.state[TO_DATE]));
    this.props.modifyMatchAllTags(this.state.matchAllTags);
    this.props.replaceTagNames(this.state.tags);
    this.props.onSave();
  }

  resetFields = () => {
    this.setState(prevState => ({
      ...prevState,
      ...this.initialFieldsState,
    }), this.handleFilterSubmit);
  }

  render() {
    const { onCancel } = this.props;
    const { description, tags, [FROM_DATE]: fromDate, [TO_DATE]: toDate } = this.state;

    return (
      <Segment className='transactions-filter padding-30'>
        <h2>Filter transactions</h2>

        <Tab
          onTabChange={(e, data) => {
            this.setState({ activeTab: data.activeIndex });
          }}
          menu={{ borderless: true, pointing: true }}
          panes={this.paneList}
        />

        <p className='margin-top-15 yaba-text-size'>
          {(!description && !fromDate && !toDate && tags.length === 0) ?
            <span>Display <b>all</b> of my transactions</span> :
            <span>
              {<FilterText
                tagNames={this.state.tags}
                {...this.state}
              />}
            </span>
          }
        </p>

        <br />

        <Button
          className='full-width-mobile blue-button'
          content='Filter'
          onClick={this.handleFilterSubmit}
          size='large'
        />

        <Button
          className='full-width-mobile margin-top-10-mobile red-button'
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
