import { ENVIRONMENT } from "@mds/common/constants";

/**
 * detect IE
 * @returns version of IE or false, if browser is not Internet Explorer
 */
export const detectIE = () => {
  const { userAgent } = window.navigator;

  // Test values; Uncomment to check result

  // IE 10
  // userAgent = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // userAgent = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  // Edge 12 (Spartan)
  // userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  // Edge 13
  // userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  const msie = userAgent.indexOf("MSIE ");
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(userAgent.substring(msie + 5, userAgent.indexOf(".", msie)), 10);
  }

  const trident = userAgent.indexOf("Trident/");
  if (trident > 0) {
    // IE 11 => return version number
    const rv = userAgent.indexOf("rv:");
    return parseInt(userAgent.substring(rv + 3, userAgent.indexOf(".", rv)), 10);
  }
  // other browser
  return false;
};

export const detectTestEnvironment = () => ENVIRONMENT.environment === "test";
export const detectProdEnvironment = () => ENVIRONMENT.environment === "production";
export const detectDevelopmentEnvironment = () => ENVIRONMENT.environment === "development";
export const getEnvironment = () => ENVIRONMENT.environment;
