import React from 'react';
import PropTypes from 'prop-types';
import { compose, equals, filter, length, match, prop, sortBy, toLower } from 'ramda';
import { Button } from 'semantic-ui-react';

class TagDropdown extends React.Component {
  static propTypes = {
    filterText: PropTypes.string,
    onSelect: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })).isRequired,
  };

  filterTags = (tags, filterText) => (
    filterText ?
      filter(
        tag => !equals(length(match(new RegExp(filterText), tag.name)), 0),
        tags
      ) : tags
  )

  sortTags = tags => (
    sortBy(compose(toLower, prop('name')))(tags)
  );

  render() {
    const {
      filterText,
      onSelect,
      tags,
    } = this.props;

    const filteredTags = this.filterTags(tags, filterText);

    return (
      filteredTags.length > 0 &&
        <div className='tag-dropdown' tabIndex="-1">
          <Button.Group basic vertical>
            {this.sortTags(filteredTags).map((tag, index) => (
              <Button
                className='tag-dropdown-option'
                key={tag.id}
                onClick={onSelect}
                tabIndex={index}
              >
                {tag.name}
              </Button>
            ))}
          </Button.Group>
        </div>
    );
  }
}

export default TagDropdown;
