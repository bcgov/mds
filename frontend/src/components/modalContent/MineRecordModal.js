import React from 'react';
import PropTypes from 'prop-types';
import MineRecordForm from '@/components/Forms/MineRecordForm';

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  mineStatusOptions: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
};

const defaultProps = {
 title: '',
 initialValues: {}
};

export const MineRecordModal = (props) => {
  return (
      <MineRecordForm {...props}/> 
  )
}

MineRecordModal.propTypes = propTypes;
MineRecordModal.defaultProps = defaultProps;

export default MineRecordModal;