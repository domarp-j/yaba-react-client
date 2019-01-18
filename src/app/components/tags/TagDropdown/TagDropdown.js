import React from 'react';
import PropTypes from 'prop-types';
import { compose, filter, prop, sortBy, toLower } from 'ramda';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';

class TagDropdown extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    filterText: PropTypes.string,
    limit: PropTypes.number,
    onSelect: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })).isRequired,
  };

  filterTags = (tags, filterText) => (
    filterText ?
      filter(
        tag => tag.name.slice(0, filterText.length).match(new RegExp(filterText)),
        tags
      ) : tags
  )

  sortTags = tags => (
    sortBy(compose(toLower, prop('name')))(tags)
  );

  render() {
    const {
      className,
      filterText,
      limit,
      onSelect,
      tags,
    } = this.props;

    const filteredTags = this.filterTags(tags, filterText);
    const dislayedTags = limit ? filteredTags.slice(0, limit) : filteredTags;

    return (
      dislayedTags.length > 0 &&
        <div className={`tag-dropdown ${className}`}>
          {this.sortTags(dislayedTags).map((tag, index) => (
            <Button
              className='tag-dropdown-option'
              key={tag.id}
              onClick={() => onSelect(tag.name)}
              tabIndex={index}
            >
              {tag.name}
            </Button>
          ))}
        </div>
    );
  }
}

const mapStateToProps = state => ({
  tags: state.transactions.tags,
});

export default connect(mapStateToProps)(TagDropdown);
