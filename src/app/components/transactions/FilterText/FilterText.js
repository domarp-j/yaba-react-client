import React from 'react';
import PropTypes from 'prop-types';
import { filter, identity } from 'ramda';

import { friendlyDate } from '../../../utils/dateTools';

/*
  This component takes transaction query values as props
    and turns them into a human-readable format.
*/
const FilterText = ({
  description,
  fromDate,
  matchAllTags,
  tagNames,
  toDate,
}) => {
  const filtersAsText = filter(identity, [
    description &&
      <span key='desc'>with <b>{`"${description}"`}</b> in the description </span>,
    fromDate &&
      <span key='fromDate'>from <b>{friendlyDate(fromDate)}</b> </span>,
    toDate &&
      <span key='toDate'>to <b>{friendlyDate(toDate)}</b> </span>,
    tagNames.length > 1 ?
      <span key='tags'>with <b>{matchAllTags ? 'all' : 'any'}</b> of the following tags: <b>{tagNames.map(tag => tag).join(' | ')}</b></span> :
      tagNames.length === 1 && <span key='tags'>with the tag <b>{`"${tagNames[0]}"`}</b></span>,
  ]);

  return (
    filtersAsText.length > 0 &&
      <span>
        {filtersAsText.map(identity)}
      </span>
  );
};

FilterText.propTypes = {
  description: PropTypes.string,
  fromDate: PropTypes.string,
  matchAllTags: PropTypes.bool,
  tags: PropTypes.arrayOf(PropTypes.string),
  toDate: PropTypes.string,
};

export default FilterText;
