import { memoize } from 'lodash';
/**
 * Utility class for validating inputs using redux forms
 */
class Validator {
  ASCII_REGEX = /^[\x0-\x7F\s]*$/;
  CAN_POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  USA_POSTAL_CODE_REGEX = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  PHONE_REGEX = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/i;
  NAME_REGEX = /^[A-Za-zÀ-ÿ'\-\s']+$/;
  FLOATS_REGEX = /^-?\d*(\.{1}\d+)?$/;
  NUMBERS_OR_EMPTY_STRING_REGEX = /^-?\d*\.?\d*$/;
  URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
  LAT_REGEX = /^(\+|-)?(?:90(?:(?:\.0{1,7})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,7})?))$/;
  LON_REGEX = /^(\+|-)?(?:180(?:(?:\.0{1,7})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,7})?))$/;
}

export const Validate = new Validator();

export const required = (value) => (value ? undefined : 'This is a required field');

export const maxLength = memoize((max) => (value) => value && value.length > max ? `Must be ${max} characters or less` : undefined);

export const minLength = memoize((min) => (value) => value && value.length < min ? `Must be ${min} characters or more` : undefined);

export const exactLength = memoize((min) => (value) => value && value.length !== min ? `Must be ${min} characters long` : undefined);

export const number = (value) => (value && isNaN(Number(value)) ? 'Coordinates must be a number' : undefined);

export const lat = (value) => value && Validate.LAT_REGEX.test(value) ? undefined: 'Invalid latitude coordinate e.g. 53.7267';

export const lon = (value) => value && Validate.LON_REGEX.test(value) ? undefined: 'Invalid longitude coordinate e.g. -127.6476000';
