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
