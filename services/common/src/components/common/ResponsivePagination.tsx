/**
 * @constant Pagination is used on the MineHomePage and ContactHomePage.js, this file was created to DRY up the pagination logic.
 */
import React, { FC } from "react";
import MediaQuery from "react-responsive";
import { Pagination } from "antd";

interface ResponsivePaginationProps {
  onPageChange: (page: number, pageSize: number) => void;
  currentPage: number;
  pageTotal: number;
  itemsPerPage: number;
}

const ResponsivePagination: FC<ResponsivePaginationProps> = ({
  onPageChange,
  currentPage = 1,
  pageTotal,
  itemsPerPage,
}) => (
  <div>
    <MediaQuery maxWidth={500}>
      <Pagination
        size="small"
        showSizeChanger
        onShowSizeChange={onPageChange}
        onChange={onPageChange}
        defaultCurrent={currentPage}
        current={currentPage}
        total={pageTotal}
        pageSizeOptions={["10", "25", "50", "75", "100"]}
        pageSize={itemsPerPage}
      />
    </MediaQuery>
    <MediaQuery minWidth={501}>
      <Pagination
        showSizeChanger
        onShowSizeChange={onPageChange}
        onChange={onPageChange}
        defaultCurrent={currentPage}
        current={currentPage}
        total={pageTotal}
        pageSizeOptions={["10", "25", "50", "75", "100"]}
        pageSize={itemsPerPage}
        showTotal={(total) => `${total} Results`}
      />
    </MediaQuery>
  </div>
);

export default ResponsivePagination;
