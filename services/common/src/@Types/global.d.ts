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
  const GLOBAL_ROUTES: any;
}

export {};
