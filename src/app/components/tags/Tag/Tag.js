import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';
import { compose } from 'ramda';
import { connect } from 'react-redux';

import { detachTagFromTransaction } from '../../../store/actions/tags';
import './Tag.css';

class Tag extends React.Component {
  static propTypes = {
    detachTagFromTransaction: PropTypes.func,
    tagId: PropTypes.number,
    tagName: PropTypes.string,
    transactionId: PropTypes.number,
  }

  constructor() {
    super();
    this.state = {
      showCTAs: false,
    };
  }

  toggleCTAs = () => this.setState(prevState => {
    return {
      showCTAs: !prevState.showCTAs,
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
    const { tagName } = this.props;
    const { showCTAs } = this.state;

    return (
      <Button.Group className='tag'>
        {/* Button displaying tag name */}
        <Button content={tagName} onClick={this.toggleCTAs} />

        {/* Edit tag - attached button */}
        {showCTAs &&
          <Button className='grouped-button' color='blue'>
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
  detachTagFromTransaction: data => { dispatch(detachTagFromTransaction(data)); },
});

export { Tag as BaseTag };
export default compose(
  connect(null, mapDispatchToProps)
)(Tag);
