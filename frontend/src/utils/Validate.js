/**
 * Utility class for validating inputs.
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

  checkASCII(str) {
    return this.ASCII_REGEX.test(str);
  }

  checkPostalCode(code) {
    return this.USA_POSTAL_CODE_REGEX.test(code) || this.CAN_POSTAL_CODE_REGEX.test(code);
  }

  checkEmail(email) {
    return this.EMAIL_REGEX.test(email);
  }

  checkPhone(phone) {
    return this.PHONE_REGEX.test(phone);
  }

  checkName(name) {
    return this.NAME_REGEX.test(name);
  }

  checkNumber(number) {
    return this.FLOATS_REGEX.test(number);
  }

  checkNumberOrEmptyString(number) {
    return this.NUMBERS_OR_EMPTY_STRING_REGEX.test(number);
  }

  checkURL(url) {
    return this.URL_REGEX.test(url);
  }

}

export const Validate = new Validator();

export const required = (value) => (value ? null : 'This is a required field');


