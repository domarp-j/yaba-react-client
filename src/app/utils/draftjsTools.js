/**
 * @param {argument provided by an input, which could be either a SyntheticEvent or EditorState} event
 */
export const isDraftjsEvent = event => event.constructor.name === 'EditorState';
