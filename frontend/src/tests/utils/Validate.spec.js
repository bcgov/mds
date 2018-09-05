import {
  required,
  maxLength,
  minLength,
  exactLength,
  number,
  lat,
  lon
} from '@/utils/Validate';

describe('Validate class', () => {
  describe('`required` function', () => {
    it('returns `undefined` if there is a value', () => {
      const value = 'test';
      expect(required(value)).toEqual(undefined);
    });

    it('returns `This is a required field` validation message', () => {
      const value = '';
      expect(required(value)).toEqual('This is a required field');
    });
  });

  describe('`maxLength` function', () => {
    it('returns `undefined` if `value` length is less than `max`', () => {
      const max = 10;
      const valueOne = '1234567890';
      expect(maxLength(max)(valueOne)).toEqual(undefined);
    });

    it('returns `Must be 10 characters or less` if `value` length is greater than `max`', () => {
      const max = 10;
      const value = '80457385746374';
      expect(maxLength(max)(value)).toEqual(`Must be ${max} characters or less`);
    });
  });

  describe('`minLength` function', () => {
    it('returns `undefined` if `value` length is greater than `min`', () => {
      const min = 7;
      const valueOne = '53456789344';
      expect(minLength(min)(valueOne)).toEqual(undefined);
    });

    it('returns `Must be 7 characters or more` if `value` length is less than `min`', () => {
      const min = 7;
      const value = '123';
      expect(minLength(min)(value)).toEqual(`Must be ${min} characters or more`);
    });
  });

  describe('`exactLength` function', () => {
    it('returns `undefined` if `value` length equals `min`', () => {
      const min = 10;
      const valueOne = '1234567890';
      expect(exactLength(min)(valueOne)).toEqual(undefined);
    });

    it('returns `Must be 10 characters long` if `value` greater than or less than `min`', () => {
      const min = 10;
      const value = '22';
      const valueTwo = '123456789012'
      expect(exactLength(min)(value)).toEqual(`Must be ${min} characters long`);
      expect(exactLength(min)(valueTwo)).toEqual(`Must be ${min} characters long`);
    });
  });

  describe('`number` function', () => {
    it('returns `undefined` if `value` is a number', () => {
      const value = 10;
      expect(number(value)).toEqual(undefined);
    });

    it('returns `Input must be a number` if `value` is not a number', () => {
      const value = 'number';
      const valueTwo = "385192451257";
      expect(number(value)).toEqual(`Input must be a number`);
      expect(number(valueTwo)).toEqual(undefined);
    });
  });

  describe('`lat` function', () => {
    it('returns `undefined` if blank', () => {
      const value = '';
      expect(lat(value)).toEqual(undefined);
    });

    it('returns `undefined` if within range of -90 to +90', () => {
      const value = '-90.0';
      const valueTwo = "90.0";
      const valueThree = '-91.0';
      const valueFour = "91.0";
      expect(lat(value)).toEqual(undefined);
      expect(lat(valueTwo)).toEqual(undefined);
      expect(lat(valueThree)).toEqual('Invalid latitude coordinate e.g. 53.7267');
      expect(lat(valueFour)).toEqual('Invalid latitude coordinate e.g. 53.7267');
    });

    it('returns `Invalid latitude coordinate e.g. 53.7267` if `value` does not have any digits after decimal', () => {
      const value = "10.";
      expect(lat(value)).toEqual('Invalid latitude coordinate e.g. 53.7267');
    });

    it('returns `Invalid latitude coordinate e.g. 53.7267` if `value` exceed 7 digits past decimal.', () => {
      const value = 10.12345678;
      expect(lat(value)).toEqual('Invalid latitude coordinate e.g. 53.7267');
    });
  });

  describe('`lon` function', () => {
    it('returns `undefined` if blank', () => {
      const value = '';
      expect(lon(value)).toEqual(undefined);
    });

    it('returns `undefined` if within range of -180 to +180', () => {
      const value = '-180.0';
      const valueTwo = "180.0";
      const valueThree = '-181.0';
      const valueFour = "181.0";
      expect(lon(value)).toEqual(undefined);
      expect(lon(valueTwo)).toEqual(undefined);
      expect(lon(valueThree)).toEqual('Invalid longitude coordinate e.g. -127.6476000');
      expect(lon(valueFour)).toEqual('Invalid longitude coordinate e.g. -127.6476000');
    });

    it('returns `Invalid longitude coordinate e.g. -127.6476000` if `value` does not have any digits after decimal', () => {
      const value = "100.";
      expect(lon(value)).toEqual('Invalid longitude coordinate e.g. -127.6476000');
    });

    it('returns `Invalid longitude coordinate e.g. -127.6476000` if `value` exceed 7 digits past decimal.', () => {
      const value = 100.12345678;
      expect(lon(value)).toEqual('Invalid longitude coordinate e.g. -127.6476000');
    });
  });
});