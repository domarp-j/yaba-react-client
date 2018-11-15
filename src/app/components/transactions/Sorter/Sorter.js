import React from 'react';
import PropTypes from 'prop-types';
import { Button, Radio, Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { keys } from 'ramda';

import {
  SORT_CATEGORIES,
  SORT_ORDERS,
  modifySortCategory,
  modifySortOrder
} from '../../../store/actions/sorting';

class Sorter extends React.Component {
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
      category: 'date',
      order: 'desc',
    };
  }

  componentDidMount() {
    this.setState({
      category: this.props.category,
      order: this.props.order,
    });
  }

  categoryToOrderLabel = {
    date: { asc: 'Show my earliest transaction first', desc: 'Show my latest transaction first' },
    value: { asc: 'From largest expense to largest income', desc: 'From largest income to largest expense' },
    description: { asc: 'In alphabetical order', desc: 'In reverse alphabetical order' },
  }

  handleCategoryChange = (e, { value }) => {
    this.setState({
      category: value,
    });
  }

  handleOrderChange = (e, { value }) => {
    this.setState({
      order: value,
    });
  }

  handleSubmit = () => {
    this.props.modifyCategory(this.state.category);
    this.props.modifyOrder(this.state.order);
    this.props.onSave();
  }

  render() {
    const { onCancel } = this.props;

    return (
      <Segment className='sorter padding-30'>
        <h2>Sort transactions</h2>

        <div className='margin-bottom-30'>
          <div className='sort-title margin-bottom-15'>
          Sort my transactions by:
          </div>
          <div>
            {keys(SORT_CATEGORIES).map(category => (
              <Radio
                key={category}
                label={category}
                name='category'
                value={category}
                checked={this.state.category === category}
                onChange={this.handleCategoryChange}
              />
            ))}
          </div>

          <div className='sort-title margin-top-bottom-15'>
          In this order:
          </div>
          <div>
            {keys(SORT_ORDERS).map(order => (
              <Radio
                key={order}
                label={this.categoryToOrderLabel[this.state.category][order]}
                name='order'
                value={order}
                checked={this.state.order === order}
                onChange={this.handleOrderChange}
              />
            ))}
          </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Sorter);
