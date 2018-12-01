import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';

import TagForm from '../TagForm';

class TagButton extends React.Component {
  static propTypes = {
    editable: PropTypes.bool,
    onClick: PropTypes.func,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    tagId: PropTypes.number,
    tagName: PropTypes.string,
    transactionId: PropTypes.number,
  }

  static defaultProps = {
    editable: true,
  }

  constructor(props) {
    super(props);
    this.state = {
      showEditDelete: false,
      showTagForm: false,
    };
  }

  toggleBoolState = stateKey => this.setState(prevState => {
    return {
      [stateKey]: !prevState[stateKey],
    };
  })

  handleClick = e => {
    const { editable, onClick, tagId, tagName, transactionId } = this.props;
    e.preventDefault();
    onClick && onClick({ tagId, tagName, transactionId });
    editable && this.toggleBoolState('showEditDelete');
  }

  render() {
    const { onDelete, onEdit, tagId, tagName, transactionId } = this.props;
    const { showEditDelete, showTagForm } = this.state;

    return (
      showTagForm ?
        <div>
          <TagForm
            initialValues={{ tagName }}
            onCancel={() => this.toggleBoolState('showTagForm')}
            onSave={onEdit}
            tagId={tagId}
            transactionId={transactionId}
          />
        </div> :
        <Button.Group>
          <Button
            className={`yaba-tag-button ${showEditDelete ? 'with-edit' : ''}`}
            content={tagName}
            onClick={this.handleClick}
          />
          {showEditDelete &&
            <Button
              className='yaba-tag-edit blue-button'
              onClick={() => this.toggleBoolState('showTagForm')}
            >
              <Button.Content>
                <Icon name='edit' className='no-margin' />
              </Button.Content>
            </Button>
          }
          {showEditDelete &&
            <Button
              className='yaba-tag-delete red-button'
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
