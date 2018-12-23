/**
 * Regex to find words prepended by the hash-character '#'
 * Useful to find tags in a description
 */
export const tagRegex = /#([^\s]*)/g;

/**
 * Strategy used to decorate tags (for draft-js)
 */
export const tagStrategy = (contentBlock, callback) => {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = tagRegex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
};

/**
 * Extract tags from a description
 */
export const extractTags = description => {
  const tags = description.match(tagRegex);

  if (tags) {
    return tags.map(tag => tag.replace(/#/, '')).filter(tag => tag !== '');
  }

  return [];
};
