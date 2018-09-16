import moment from 'moment';
import { currentDateMDY, dateToMDY, dateToYMD, friendlyDate } from './dateTools';

describe('currentDateMDY', () => {
  it('returns the current date in MM/DD/YYYY', () => {
    const expected = moment().format('MM/DD/YYYY');
    const actual = currentDateMDY();
    expect(expected).toEqual(actual);
  });
});

describe('dateToMDY', () => {
  it('converts date from ISO to MM/DD/YYYY', () => {
    const expected = '03/25/2015';
    const actual = dateToMDY('2015-03-25T00:00:00Z');
    expect(expected).toEqual(actual);
  });

  it('converts date from YYYY-MM-DD to MM/DD/YYYY', () => {
    const expected = '12/31/1999';
    const actual = dateToMDY('1999-12-31');
    expect(expected).toEqual(actual);
  });
});

describe('dateToYMD', () => {
  it('converts date from ISO to YYYY-MM-DD', () => {
    const expected = '2019-04-18';
    const actual = dateToYMD('2019-04-18T00:00:00Z');
    expect(expected).toEqual(actual);
  });

  it('converts date from MM/DD/YYYY to YYYY-MM-DD', () => {
    const expected = '2017-09-11';
    const actual = dateToYMD('09/11/2017');
    expect(expected).toEqual(actual);
  });
});

describe('friendlyDate', () => {
  it('converts date from MM/DD/YYYY to a human-readable format', () => {
    const expected = 'August 18, 2019';
    const actual = friendlyDate('08/18/2019');
    expect(expected).toEqual(actual);
  });

  it('converts date from YYYY-MM-DD to a human-readable format', () => {
    const expected = 'November 13, 2010';
    const actual = friendlyDate('2010-11-13');
    expect(expected).toEqual(actual);
  });
});
