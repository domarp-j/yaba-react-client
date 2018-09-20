import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { keys } from 'ramda';

import {
  SORT_CATEGORIES,
  SORT_ORDERS,
  modifySortCategory,
  modifySortOrder
} from '../../../store/actions/transactionSorting';

import './TransactionSort.css';

class TransactionSort extends React.Component {
  static propTypes = {
    category: PropTypes.string,
    modifyCategory: PropTypes.func,
    modifyOrder: PropTypes.func,
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
    order: PropTypes.string,
  }

  constructor() {
    super();
    this.state = {
      category: undefined,
      order: undefined,
    };
  }

  componentDidMount() {
    this.setState({
      category: this.props.category,
      order: this.props.order,
    });
  }

  stateKeyToSortParam = {
    category: SORT_CATEGORIES,
    order: SORT_ORDERS,
  }

  optionsFor = stateKey => (
    keys(this.stateKeyToSortParam[stateKey]).map(sortParam => ({
      key: sortParam,
      text: sortParam,
      value: sortParam,
      content: sortParam,
    }))
  )

  handleChange = (e, stateKey) => {
    this.setState({
      [stateKey]: e.target.innerText,
    });
  }

  handleSubmit = () => {
    this.props.modifyCategory(this.state.category);
    this.props.modifyOrder(this.state.order);
    this.props.onSave();
  }

  render() {
    const { onCancel } = this.props;
    const { category, order } = this.state;

    return (
      <Segment className='padding-30'>
        <h2>Sort transactions</h2>

        <div
          className='margin-top-bottom-30'
          id='sort-text'
        >
          Sort by <Dropdown
            inline
            header='Change description'
            onChange={e => this.handleChange(e, 'category')}
            options={this.optionsFor('category')}
            text={category}
            value={category}
          /> in <Dropdown
            inline
            header='Change order'
            onChange={e => this.handleChange(e, 'order')}
            options={this.optionsFor('order')}
            text={order}
            value={order}
          /> order
        </div>

        <Button
          className='full-width-mobile'
          color='yellow'
          content='Sort'
          onClick={this.handleSubmit}
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
  category: state.transactions.sorting.category,
  order: state.transactions.sorting.order,
});

const mapDispatchToProps = dispatch => ({
  modifyCategory: category => dispatch(modifySortCategory(category)),
  modifyOrder: order => dispatch(modifySortOrder(order)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionSort);
