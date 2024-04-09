/**
 * @constant Pagination is used on the MineHomePage and ContactHomePage.js, this file was created to DRY up the pagination logic.
 */
import React from "react";
import PropTypes from "prop-types";
import MediaQuery from "react-responsive";
import { Pagination } from "antd";

const propTypes = {
  onPageChange: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  pageTotal: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
};

const ResponsivePagination = (props) => (
  <div>
    <MediaQuery maxWidth={500}>
      <Pagination
        size="small"
        showSizeChanger
        onShowSizeChange={props.onPageChange}
        onChange={props.onPageChange}
        defaultCurrent={props.currentPage}
        current={props.currentPage}
        total={props.pageTotal}
        pageSizeOptions={["10", "25", "50", "75", "100"]}
        pageSize={props.itemsPerPage}
      />
    </MediaQuery>
    <MediaQuery minWidth={501}>
      <Pagination
        showSizeChanger
        onShowSizeChange={props.onPageChange}
        onChange={props.onPageChange}
        defaultCurrent={props.currentPage}
        current={props.currentPage}
        total={props.pageTotal}
        pageSizeOptions={["10", "25", "50", "75", "100"]}
        pageSize={props.itemsPerPage}
        showTotal={(total) => `${total} Results`}
      />
    </MediaQuery>
  </div>
);

ResponsivePagination.propTypes = propTypes;
export default ResponsivePagination;
