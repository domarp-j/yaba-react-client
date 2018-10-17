import React from 'react';
import PropTypes from 'prop-types';

const Tag = ({ content }) => (
  <div className='yaba-tag'>{content}</div>
);

Tag.propTypes = {
  content: PropTypes.string,
};

export default Tag;
