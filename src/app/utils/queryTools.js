import React from 'react';
import { filter, identity } from 'ramda';
import { friendlyDate } from './dateTools';

export const filterQueryText = ({
  description,
  fromDate,
  toDate,
  matchAllTags,
  tags,
}) => (
  filter(identity, [
    description && <span key='desc'>with <b>{`"${description}"`}</b> in the description </span>,
    fromDate && <span key='fromDate'>starting from <b>{friendlyDate(fromDate)}</b> </span>,
    toDate && <span key='toDate'>up to <b>{friendlyDate(toDate)}</b> </span>,
    tags.length > 1 ?
      <span key='tags'>with {matchAllTags ? 'ALL' : 'ANY'} of the tags <b>{tags.map(tag => `"${tag}"`).join(', ')}</b></span> :
      tags.length === 1 && <span key='tags'>with the tag <b>{`"${tags[0]}"`}</b></span>,
  ])
);
