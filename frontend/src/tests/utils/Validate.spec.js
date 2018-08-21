import {
  required,
  maxLength,
  minLength,
  exactLength
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

});