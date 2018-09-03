import React from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';
import { compose } from 'ramda';
import { connect } from 'react-redux';

import AddTag from '../../tags/AddTag';
import Tag from '../../tags/Tag';
import TagForm from '../../tags/TagForm';
import {
  addTagNameToTransactionQuery,
  removeTagNameFromTransactionQuery
} from '../../../store/actions/transactionQueries';

class TransactionFilter extends React.Component {
  static propTypes = {
    addTag: PropTypes.func,
    removeTag: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.string),
  };

  constructor() {
    super();
    this.state = {
      showAddTag: false,
    };
  }

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
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
        </div>
      </Segment>
    );
  }
}

const mapStateToProps = state => ({
  tags: state.transactions.queries.tagNames,
});

const mapDispatchToProps = dispatch => ({
  addTag: tagName => dispatch(addTagNameToTransactionQuery(tagName)),
  removeTag: tagName => dispatch(removeTagNameFromTransactionQuery(tagName)),
});

export { TransactionFilter as BaseTransactionFilter };
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(TransactionFilter);
