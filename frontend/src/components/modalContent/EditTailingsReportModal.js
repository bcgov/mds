import React from 'react';
import PropTypes from 'prop-types';
import EditTailingsReportForm from '@/components/Forms/EditTailingsReportForm';

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
};

const defaultProps = {
 title: ''
};

export const EditTailingsReportModal = (props) => {
  return (
  <div>
    <EditTailingsReportForm {...props}/>
  </div>
  );
}

EditTailingsReportModal.propTypes = propTypes;
EditTailingsReportModal.defaultProps = defaultProps;
export default EditTailingsReportModal;