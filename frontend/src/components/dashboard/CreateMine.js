// import React, { Component } from 'react';
// import { Button } from 'antd';
// import PropTypes from 'prop-types';
// import queryString from 'query-string'
// import { CreateGuard } from '@/HOC/CreateGuard';
// import * as String from '@/constants/strings';
// import { modalConfig } from '@/components/modalContent/config';

// /**
//  * @class CreateMine - Component to create a mine record.
//  */

// const propTypes = {
//   fetchMineRecords: PropTypes.func.isRequired,
//   createMineRecord: PropTypes.func.isRequired,
//   location: PropTypes.shape({ search: PropTypes.string }).isRequired,
//   mineStatusOptions: PropTypes.array
// };

// export class CreateMine extends Component {
//   handleSubmit = (value) => {
//     let mineStatus = value.mine_status.join(",");
//     this.props.createMineRecord({...value, mine_status: mineStatus}).then(() => {
//       this.props.closeModal();
//     }).then(() => {
//       const params = queryString.parse(this.props.location.search);
//       if (params.page && params.per_page) {
//         this.props.fetchMineRecords(params.page, params.per_page);
//       } else {
//         this.props.fetchMineRecords(String.DEFAULT_PAGE, String.DEFAULT_PER_PAGE);
//       }
//     });
//   }

//   openModal(event, mineStatusOptions, onSubmit, title) {
//     event.preventDefault();
//     this.props.openModal({
//       props: { mineStatusOptions, onSubmit, title},
//       content: modalConfig.MINE_RECORD
//     });
//   }

//   render() {
//     return (
//       <div>
//         <div className="right center-mobile">
//           <Button className="full-mobile" type="primary" size="large" onClick={(event) => this.openModal(event, this.props.mineStatusOptions, this.handleSubmit, 'Create Mine Record')}>
//               Create Mine Record
//           </Button>
//         </div>
//       </div>
//     );
//   }
// }

// CreateMine.propTypes = propTypes;

// export default CreateGuard(CreateMine);
