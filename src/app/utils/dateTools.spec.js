import { dateify } from './dateTools';

describe('dateify', () => {
  it('converts ISO date format into MM/DD/YYYY format', () => {
    const expected = '03/25/2015';
    const actual = dateify('2015-03-25T12:00:00Z');
    expect(expected).toEqual(actual);
  });
});
