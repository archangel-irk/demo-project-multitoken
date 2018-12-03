/* tslint:disable:object-literal-sort-keys */

export enum ChartPeriod {
  ONE_DAY = '1d',
  SEVEN_DAYS = '7d',
  ONE_MONTH = '1m',
  THREE_MONTHS = '3m',
  ONE_YEAR = '1y',
}

/**
 * HTTP Status Codes defined in RFC 2616 and RFC 6585.
 * @see http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
 * @see http://tools.ietf.org/html/rfc6585
 * @enum {number}
 */
export const HttpStatus = {
  // Informational 1xx
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,

  // Successful 2xx
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,

  // Redirection 3xx
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,

  // Client Error 4xx
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  REQUEST_ENTITY_TOO_LARGE: 413,
  REQUEST_URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  REQUEST_RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,

  // Server Error 5xx
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  NETWORK_AUTHENTICATION_REQUIRED: 511,

  /*
   * IE returns this code for 204 due to its use of URLMon, which returns this
   * code for 'Operation Aborted'. The status text is 'Unknown', the response
   * headers are ''. Known to occur on IE 6 on XP through IE9 on Win7.
   */
  QUIRK_IE_NO_CONTENT: 1223
};


/**
 * HTTP Status Code Names defined in RFC 2616 and RFC 6585.
 * @see http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
 * @see http://tools.ietf.org/html/rfc6585
 * @type {!Object<number, string>}
 */
export const HttpStatusName = {
  // Informational 1xx
  100: 'Continue',
  101: 'Switching Protocols',

  // Successful 2xx
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',

  // Redirection 3xx
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',

  // Client Error 4xx
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',

  // Server Error 5xx
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  511: 'Network Authentication Required'
};
