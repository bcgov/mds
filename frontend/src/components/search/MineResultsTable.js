// import React from "react";
// import { Table, Row, Col, Divider } from "antd";
// import CustomPropTypes from "@/customPropTypes";
// import PropTypes from "prop-types";
// import { connect } from "react-redux";
// import Highlight from "react-highlighter";

// import { Link } from "react-router-dom";
// import * as router from "@/constants/routes";
// import * as Strings from "@/constants/strings";

// /**
//  * @class  MineResultsTable - displays a table of mine search results
//  */

// const propTypes = {
//   header: PropTypes.string.isRequired,
//   highlightRegex: PropTypes.object.isRequired,
//   searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
// };

// const defaultProps = {};

// export const MineResultsTable = (props) => {
//   const columns = [
//     {
//       title: "Mine Guid",
//       dataIndex: "mine_guid",
//       key: "mine_guid",
//       render: (text, record) => [
//         <Row>
//           <Col span={24}>
//             <Link to={router.MINE_SUMMARY.dynamicRoute(record.mine_guid)}>
//               <p style={{ fontSize: "22px", color: "inherit" }}>
//                 <Highlight search={props.highlightRegex}>{record.mine_name}</Highlight>
//               </p>
//             </Link>
//           </Col>
//         </Row>,
//         <Row style={{ paddingTop: "5px" }}>
//           <Col span={4}>Mine No.</Col>
//           <Col span={6}>
//             <Highlight search={props.highlightRegex}>{record.mine_no}</Highlight>
//           </Col>
//           <Col span={4}>Permit No.</Col>
//           <Col span={10}>
//             {record.mine_permit.map((permit) => [<span>{permit.permit_no}</span>, <br />])}
//           </Col>
//         </Row>,
//         <Row style={{ paddingTop: "5px", paddingBottom: "15px" }}>
//           <Col span={4}>Region</Col>
//           <Col span={6}>{record.region_code}</Col>
//           <Col span={4}>Status</Col>
//           <Col span={10}>
//             {record.mine_status[0] && record.mine_status[0].status_labels.join(", ")}
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

// MineResultsTable.propTypes = propTypes;
// MineResultsTable.defaultProps = defaultProps;

// export default connect(mapStateToProps)(MineResultsTable);
