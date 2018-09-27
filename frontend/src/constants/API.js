//Network URL's
export const MINE = '/mine';
export const MINE_LIST = '/mines';
export const MINE_LIST_QUERY = (page, per_page, map) => map ? `/mines?page=${page}&per_page=${per_page}&map=true` : `/mines?page=${page}&per_page=${per_page}`;
export const PARTY = '/person';
export const PARTIES  = (value) => value ? `/persons?search=${value}` : `/persons`;
export const MANAGER = '/manager';
export const MINE_NAME_LIST = '/mines/names';