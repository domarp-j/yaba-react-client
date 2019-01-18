import { extractTags } from './tagTools';

describe('tagToolss', () => {
  describe('extractTags', () => {
    let description, expected, actual;

    it('returns all #tags in a provided description', () => {
      description = 'This is a #test description with #tag1 and #tag2';

      expected = ['test', 'tag1', 'tag2'];
      actual = extractTags(description);

      expect(expected).toEqual(actual);
    });

    it('downcases all tags', () => {
      description = 'This is a #teSt description with #Tag1 and #Tag2';

      expected = ['test', 'tag1', 'tag2'];
      actual = extractTags(description);

      expect(expected).toEqual(actual);
    });

    it('removes duplicate tags', () => {
      description = 'This is a #test description with a #test tag #tag1 #tag2';

      expected = ['test', 'tag1', 'tag2'];
      actual = extractTags(description);

      expect(expected).toEqual(actual);
    });
  });
});
