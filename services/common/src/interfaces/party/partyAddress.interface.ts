export interface IPartyAddress {
  address_line_1?: string;
  address_line_2?: string;
  /** Country code (ie. CAN, USA, etc.) */
  address_type_code: string;
  city?: string;
  post_code?: string;
  /** Province/State code (ie. BC, AB, etc.) */
  sub_division_code?: string;
  suite_no?: string;
}
