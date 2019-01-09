import { uniq } from 'ramda';

/**
 * Regex to find words prepended by the hash-character '#'
 * Useful to find tags in a description
 */
export const tagRegex = /#([^\s]*)/g;

/**
 * Extract tags from a description
 */
export const extractTags = description => {
  const tags = description.match(tagRegex);

  if (tags) {
    const allTags = tags.map(tag => tag.toLowerCase().replace(/#/, '')).filter(tag => tag !== '');
    return uniq(allTags);
  }

  return [];
};

