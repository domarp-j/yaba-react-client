import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';

import TagForm from '../TagForm';

class TagButton extends React.Component {
  static propTypes = {
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
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

  render() {
    const { onDelete, onEdit, tagId, tagName, transactionId } = this.props;
    const { showCTAs, showEdit } = this.state;

    return (
      showEdit ?
        <div className='third-width'>
          <TagForm
            initialValues={{ tagName }}
            onCancel={() => this.toggleBoolState('showEdit')}
            onSave={onEdit}
            tagId={tagId}
            transactionId={transactionId}
          />
        </div> :
        <Button.Group>
          <Button
            className={`yaba-tag-button ${showCTAs ? 'with-edit' : ''}`}
            content={tagName}
            onClick={e => { e.preventDefault(); this.toggleBoolState('showCTAs'); }}
          />
          {showCTAs &&
            <Button
              className='yaba-tag-edit info-button'
              onClick={() => this.toggleBoolState('showEdit')}
            >
              <Button.Content>
                <Icon name='edit' className='no-margin' />
              </Button.Content>
            </Button>
          }
          {showCTAs &&
            <Button
              className='yaba-tag-delete error-button'
              onClick={() => onDelete({ tagId, tagName, transactionId })}
            >
              <Button.Content>
                <Icon name='trash' className='no-margin' />
              </Button.Content>
            </Button>
          }
        </Button.Group>
    );
  }
}

export default TagButton;
