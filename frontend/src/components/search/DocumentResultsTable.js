// import React from "react";
// import { Table, Menu, Dropdown, Button, Icon, Row, Col, Divider } from "antd";
// import CustomPropTypes from "@/customPropTypes";
// import PropTypes from "prop-types";
// import { connect } from "react-redux";
// import Highlight from "react-highlighter";

// import { Link } from "react-router-dom";
// import * as router from "@/constants/routes";
// import * as Strings from "@/constants/strings";

// import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";

// /**
//  * @class  DocumentResultsTable - displays a table of mine search results
//  */

// const propTypes = {
//   header: PropTypes.string.isRequired,
//   highlightRegex: PropTypes.object.isRequired,
//   searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
// };

// const defaultProps = {};

// export const DocumentResultsTable = (props) => {
//   const columns = [
//     {
//       title: "Document Guid",
//       dataIndex: "document_guid",
//       key: "document_guid",
//       render: (text, record) => [
//         <Row style={{ paddingBottom: "15px" }}>
//           <Col span={24}>
//             <a
//               key={record.mine_document_guid}
//               onClick={() =>
//                 downloadFileFromDocumentManager(record.document_manager_guid, record.document_name)
//               }
//             >
//               <p style={{ fontSize: "22px", color: "inherit" }}>
//                 <Highlight search={props.highlightRegex}>{record.document_name}</Highlight>
//               </p>
//             </a>
//           </Col>
//         </Row>,
//       ],
//     },
//   ];
//   return (
//     <Col md={12} sm={24} style={{ padding: "30px", paddingBottom: "60px" }}>
//       <h2>{props.header}</h2>
//       <Divider />
//       <Table
//         className="nested-table"
//         align="left"
//         showHeader={false}
//         pagination={false}
//         columns={columns}
//         dataSource={props.searchResults}
//       />
//     </Col>
//   );
// };

// const mapStateToProps = (state) => ({});

// DocumentResultsTable.propTypes = propTypes;
// DocumentResultsTable.defaultProps = defaultProps;

// export default connect(mapStateToProps)(DocumentResultsTable);
