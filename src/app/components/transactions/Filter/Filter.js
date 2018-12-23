import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Segment, Tab } from 'semantic-ui-react';
import { compose } from 'ramda';
import { connect } from 'react-redux';
import moment from 'moment';
import { CompositeDecorator, ContentState, Editor, EditorState } from 'draft-js';

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
import { isDraftjsEvent } from '../../../utils/draftjsTools';
import { extractTags, tagStrategy } from '../../../utils/tagTools';

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

    this.compositeDecorator = new CompositeDecorator([{
      strategy: tagStrategy,
      component: this.TagSpan,
    }]);

    this.state = {
      ...this.initialFieldsState,
      activeTab: this.paneList.indexOf(this.panes.desc),
      matchAllTags: true,
      tagEditor: EditorState.createWithContent(
        ContentState.createFromText(props.tags.map(tag => `#${tag}`).join(' ')),
        this.compositeDecorator
      ),
      tagInput: '',
    };
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

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
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

  dateFields = () => {
    const style = { padding: '0', zIndex: 1001 };

    return (<div>
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
      </Form>
    </div>);
  }

  tagFields = () => (
    <div>
      <Form>
        <Form.Group>
          <Form.Field
            width={16}
          >
            <label htmlFor='tags'>Tags <span>(i.e. #food and #travel)</span></label>
            <div className='input-imitation tag-field hidden-tablet-and-mobile'>
              <Editor
                editorState={this.state.tagEditor}
                onChange={this.handleTagsChange}
              />
            </div>
            <div className='tablet-and-mobile-only'>
              <Form.Input
                onChange={this.handleTagsChange}
              />
            </div>
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
    const usingDraftjs = isDraftjsEvent(event);

    let newState;
    let text;

    if (usingDraftjs) {
      newState = { tagEditor: event };
      text = event.getCurrentContent().getPlainText();
    }  else {
      text = event.target.value;
      newState = { tagInput: text };
    }

    this.setState({
      ...newState,
      tags: extractTags(text),
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

  /**
   * Tag element & styling (for draft-js)
   */
  TagSpan = props => {
    return (
      <span
        {...props}
        className='filter-tag'
        onClick={() => this.handleTagSpanClick(props)}>
        <Button>
          {props.children}
        </Button>
      </span>
    );
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
