import { errorsList, allFieldsTouched, anyErrorsPresent } from './formikTools';

describe('formikTools', () => {
  describe('errorsList', () => {
    it('returns all error messages as an array', () => {
      const testErrors = {
        field1: 'You should do this',
        field2: 'You should do that',
      };

      const listedErrors = errorsList(testErrors);

      expect(listedErrors).toContain('You should do this');
      expect(listedErrors).toContain('You should do that');
    });

    it('returns an empty array if no errors are present', () => {
      const testErrors = {};

      const listedErrors = errorsList(testErrors);

      expect(listedErrors).toEqual([]);
    });
  });

  describe('allFieldsTouched', () => {
    it('returns true if all values are true in touched object', () => {
      const testTouched = {
        a: true,
        b: true,
        c: true,
      };
      const testFields = ['a', 'b', 'c'];

      expect(allFieldsTouched(testTouched, testFields)).toEqual(true);
    });

    it('returns false if any values are false in touched object', () => {
      const testTouched = {
        a: true,
        b: false,
        c: true,
      };
      const testFields = ['a', 'b', 'c'];

      expect(allFieldsTouched(testTouched, testFields)).toEqual(false);
    });

    it('returns false if any fields are missing from the touched object', () => {
      const testTouched = {
        a: true,
        b: true,
      };
      const testFields = ['a', 'b', 'c'];

      expect(allFieldsTouched(testTouched, testFields)).toEqual(false);
    });

    it('returns false if touched object is empty', () => {
      const testTouched = {};
      const testFields = ['a', 'b', 'c'];

      expect(allFieldsTouched(testTouched, testFields)).toEqual(false);
    });
  });

  describe('anyErrorsPresent', () => {
    it('returns true if errors array is populated', () => {
      expect(anyErrorsPresent(['There is an error'])).toEqual(true);
    });

    it('returns false if errors array is not populated', () => {
      expect(anyErrorsPresent([])).toEqual(false);
    });
  });
});
