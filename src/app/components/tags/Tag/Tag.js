import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';
import { compose } from 'ramda';
import { connect } from 'react-redux';

import TagForm from '../TagForm';
import {
  detachTagFromTransaction,
  modifyTransactionTag
} from '../../../store/actions/transactionTags';
import './Tag.css';

class Tag extends React.Component {
  static propTypes = {
    detachTagFromTransaction: PropTypes.func,
    modifyTransactionTag: PropTypes.func,
    tagId: PropTypes.number,
    tagName: PropTypes.string,
    transactionId: PropTypes.number,
  }

  constructor() {
    super();
    this.state = {
      showCTAs: false,
      showEdit: false,
    };
  }

  toggleBoolState = stateKey => this.setState(prevState => {
    return {
      [stateKey]: !prevState[stateKey],
    };
  })

  handleDelete = () => {
    this.props.detachTagFromTransaction({
      tagId: this.props.tagId,
      tagName: this.props.tagName,
      transactionId: this.props.transactionId,
    });
  }

  render() {
    const { modifyTransactionTag, tagId, tagName, transactionId } = this.props;
    const { showCTAs, showEdit } = this.state;

    return (
      showEdit ?
        // Editing tag
        <TagForm
          initialValues={{ tagName }}
          onCancel={() => this.toggleBoolState('showEdit')}
          onSubmit={modifyTransactionTag}
          tagId={tagId}
          transactionId={transactionId}
        /> :

        // Displaying tag
        <Button.Group className='tag'>
          {/* Button displaying tag name */}
          <Button content={tagName} onClick={() => this.toggleBoolState('showCTAs')} />

          {/* Edit tag - attached button */}
          {showCTAs &&
          <Button className='grouped-button' color='blue' onClick={() => this.toggleBoolState('showEdit')}>
            <Button.Content className='no-padding'>
              <Icon name='edit' className='no-margin' />
            </Button.Content>
          </Button>
          }

          {/* Delete tag - attached button */}
          {showCTAs &&
          <Button className='grouped-button' color='red' onClick={this.handleDelete}>
            <Button.Content className='no-padding'>
              <Icon name='trash' className='no-margin' />
            </Button.Content>
          </Button>
          }
        </Button.Group>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  detachTagFromTransaction: data => dispatch(detachTagFromTransaction(data)),
  modifyTransactionTag: data => dispatch(modifyTransactionTag(data)),
});

export { Tag as BaseTag };
export default compose(
  connect(null, mapDispatchToProps)
)(Tag);
