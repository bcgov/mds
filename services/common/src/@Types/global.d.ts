import { CoreRoute } from "../interfaces/common/route.interface";
import { ItemMap } from "../interfaces/common/itemMap.interface";

declare global {
  const REQUEST_HEADER: {
    createRequestHeader: (
      customHeaders?: any
    ) => {
      headers: {
        "Access-Control-Allow-Origin": string;
        Authorization: string;
        [prop: string]: any;
      };
    };
  };
  const GLOBAL_ROUTES: ItemMap<CoreRoute>;
}

export {};
