import { tagRegex } from './tagTools';

/**
 * Determine whether an argument provided by an input handler is an editorState instance
 */
export const isDraftjsEvent = e => e.constructor.name === 'EditorState';

/**
 * Tag strategy for draft-js
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
 * Determine if cursor is in a tag
 */
// export const hasCursorInTag = editorState => {
//   // Get text inside editorState
//   const text = editorState.getCurrentContent().getPlainText();

//   // Get cursor position (0 => beginning, 1 => after first char, and so on)
//   let position = editorState.getSelection().getStartOffset();

//   // Determine whether the currently-selected word is a #tag
//   while (position !== 0 && !text[position - 1].match(/\s/)) {
//     if (text[position - 1].match(/#/)) {
//       return {
//         word: text.substring(position - 1).split(' ')[0],
//         position: position - 1,
//       };
//     }
//     position -= 1;
//   }
//   return;
// };
