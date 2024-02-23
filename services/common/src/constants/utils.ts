export const serverSidePaginationOptions = (pageData) => {
  return {
    defaultCurrent: 1,
    current: pageData?.current,
    total: pageData?.total,
    pageSize: pageData?.items_per_page,
    showSizeChanger: true,
    position: ["bottomCenter"],
  };
};

export const parseSortDir = (sortDir) => {
  if (!sortDir) return undefined;
  return sortDir === "ascend" ? "asc" : "desc";
};

export const parseServerSideSearchOptions = (pagination, filters, sorter) => {
  Object.keys(filters).forEach((key) => !filters[key] && delete filters[key]);
  return {
    per_page: pagination.pageSize,
    page: pagination?.current,
    sort_field: sorter?.column?.dataIndex || undefined,
    sort_dir: parseSortDir(sorter.order),
    ...filters,
  };
};

export const removeNullValues = (obj) => {
  Object.keys(obj).forEach((key) => obj[key] === null && delete obj[key]);
  return obj;
};

export const removeNullValuesRecursive = (values: any) => {
  // spread to prevent unwanted state mutation
  const obj = { ...values };
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val === null) {
      delete obj[key];
      // if the property is an object, allow empty array
    } else if (val instanceof Object === true && !Array.isArray(val)) {
      const temp = removeNullValuesRecursive(val);
      // and if none left, delete it
      if (Object.keys(temp).length === 0) {
        delete obj[key];
      }
    }
  });
  return obj;
};

export const getProjectStatusDescription = (
  projectSummaryStatusCode,
  majorMineApplicationStatusCode,
  irtStatusCode
) => {
  if (
    projectSummaryStatusCode === "WDN" ||
    majorMineApplicationStatusCode === "WDN" ||
    irtStatusCode === "WDN"
  ) {
    return "Inactive";
  }
  return "Active";
};
