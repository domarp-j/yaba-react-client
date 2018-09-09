import { dollarToFloat, floatToDollar } from './dollarTools';

describe('floatToDollar', () => {
  it('converts a positive integer into a dollar string', () => {
    const expected = '$26.00';
    const actual = floatToDollar(26);
    expect(expected).toEqual(actual);
  });

  it('converts a positive value with one decimal place into a dollar string', () => {
    const expected = '$26.50';
    const actual = floatToDollar(26.5);
    expect(expected).toEqual(actual);
  });

  it('converts a positive value with two decimal places into a dollar string', () => {
    const expected = '$26.52';
    const actual = floatToDollar(26.52);
    expect(expected).toEqual(actual);
  });

  it('converts a negative integer into a dollar string', () => {
    const expected = '-$13.00';
    const actual = floatToDollar(-13);
    expect(expected).toEqual(actual);
  });

  it('converts a negative value with one decimal plae into a dollar string', () => {
    const expected = '-$13.60';
    const actual = floatToDollar(-13.6);
    expect(expected).toEqual(actual);
  });

  it('converts a negative value with two decimal places into a dollar string', () => {
    const expected = '-$13.65';
    const actual = floatToDollar(-13.65);
    expect(expected).toEqual(actual);
  });
});

describe('dollarToFloat', () => {
  it('converts a positive dollar amount to a float', () => {
    const expected = 26.22;
    const actual = dollarToFloat('$26.22');
    expect(expected).toEqual(actual);
  });

  it('converts a positive dollar amount with explicit plus sign to a float', () => {
    const expected = 26.22;
    const actual = dollarToFloat('+$26.22');
    expect(expected).toEqual(actual);
  });

  it('converts a negative dollar to a float', () => {
    const expected = -115.98;
    const actual = dollarToFloat('-$115.98');
    expect(expected).toEqual(actual);
  });
});
