// import React from "react";
// import PropTypes from "prop-types";
// import { Field, reduxForm } from "redux-form";
// import { Form, Col, Row } from "antd";
// import * as FORM from "@/constants/forms";
// import { required } from "@/utils/Validate";
// import { renderConfig } from "@/components/common/config";
// import CustomPropTypes from "@/customPropTypes";

// const propTypes = {
//   initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
//   inspectors: CustomPropTypes.groupOptions.isRequired,
// };

// export const UpdateNOWLeadInspectorForm = (props) => (
//   <div>
//     <Form layout="vertical">
//       <Row gutter={48}>
//         <Col>
//           <Form.Item>
//             <Field
//               id="lead_inspector_party_guid"
//               name="lead_inspector_party_guid"
//               label="Lead Inspector*"
//               placeholder="Start typing lead inspector name"
//               component={renderConfig.GROUPED_SELECT}
//               validate={[required]}
//               data={props.inspectors}
//             />
//           </Form.Item>
//         </Col>
//       </Row>
//     </Form>
//   </div>
// );

// UpdateNOWLeadInspectorForm.propTypes = propTypes;

// export default reduxForm({
//   form: FORM.UPDATE_NOW_LEAD_INSPECTOR,
//   destroyOnUnmount: false,
//   forceUnregisterOnUnmount: true,
//   touchOnBlur: true,
// })(UpdateNOWLeadInspectorForm);
