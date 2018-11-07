//Network URL's
export const MINE = '/mines';
export const MINE_LIST = '/mines';
export const MINE_LIST_QUERY = (page, per_page, search="", map) => map ? `/mines?page=${page}&per_page=${per_page}&search=${search}&map=true` : `/mines?page=${page}&per_page=${per_page}&search=${search}`;
export const PARTY = '/parties';
export const PARTIES  = (search) => search ? `/parties?search=${search}` : '/parties';
export const MANAGER = '/parties/managers';
export const PERMITTEE = '/permits/permittees';
export const MINE_NAME_LIST = (search) => search ? `/mines/names?search=${search}` : '/mines/names';
export const MINE_STATUS = '/mines/status';
