// import React from 'react';
// import PropTypes from 'prop-types';
// import { Field, reduxForm } from 'redux-form'
// import RenderField from '@/components/common/RenderField';
// import { Form, Button, Col, Row } from 'antd';
// import * as FORM from '@/constants/forms';
// import { required, email, phoneNumber, maxLength, number } from '@/utils/Validate';
// import { resetForm } from '@/utils/helpers';

// const propTypes = {
//   handleSubmit: PropTypes.func.isRequired
// };

// export const AddPermitteeForm = (props) => {
//   return (
//     <div className="form__parties">
//       <Form layout="vertical" onSubmit={props.handleSubmit}>
//         <Row gutter={16}>
//           <Col span={24}>
//             <Form.Item>
//               <Field
//                 id="companyName"
//                 name="companyName"
//                 label='Company Name *'
//                 component={RenderField}
//                 validate={[required]}
//               />
//             </Form.Item>
//           </Col>
//         </Row>
//         <Row gutter={16}>
//           <Col span={24}>
//             <Form.Item>
//               <Field
//                 id="email"
//                 name="email"
//                 label='Email *'
//                 component={RenderField}
//                 validate={[required, email]}
//               />
//             </Form.Item>
//           </Col>
//         </Row>
//         <Row gutter={16}>
//           <Col span={18}>
//             <Form.Item>
//               <Field
//                 id="phone_no"
//                 name="phone_no"
//                 label='Phone Number *'
//                 placeholder="e.g. xxx-xxx-xxxx"
//                 component={RenderField}
//                 validate={[required, phoneNumber, maxLength(12)]}
//               />
//             </Form.Item>
//             </Col>
//             <Col span={6}>
//               <Form.Item>
//                 <Field
//                   id="phone_ext"
//                   name="phone_ext"
//                   label='Ext'
//                   component={RenderField}
//                   validate={[number, maxLength(4)]}
//                 />
//               </Form.Item>
//             </Col>
//           </Row >
//         <div className="right center-mobile"><Button className="full-mobile" type="primary" htmlType="submit">Create Company</Button></div>
//       </Form>
//     </div>
//   );
// };

// AddPermitteeForm.propTypes = propTypes;

// export default (reduxForm({
//     form: FORM.ADD_PERMITTEE,
//     onSubmitSuccess: resetForm(FORM.ADD_PERMITTEE),
//   })(AddPermitteeForm)
// );