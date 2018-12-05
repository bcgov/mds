import React from 'react';
import PropTypes from 'prop-types';
import EditTailingsReportForm from '@/components/Forms/EditTailingsReportForm';

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  statusOptions: PropTypes.array.isRequired,
  initialValues: PropTypes.object,
};

const defaultProps = {
 title: '',
 initialValues: null,
};

export const EditTailingsReportModal = (props) => (
  <div>
    <EditTailingsReportForm {...props} />
  </div>
  )

EditTailingsReportModal.propTypes = propTypes;
EditTailingsReportModal.defaultProps = defaultProps;

export default EditTailingsReportModal;