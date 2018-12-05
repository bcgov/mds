import React from 'react';
import PropTypes from 'prop-types';
import MineRecordForm from '@/components/Forms/MineRecordForm';

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  mineStatusOptions: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
  hasTSF: PropTypes.bool,
  toggleTSF: PropTypes.func,
};

const defaultProps = {
  title: '',
  initialValues: null,
};

export const MineRecordModal = (props) => (
  <div>
    <MineRecordForm {...props} />
  </div>
  )

MineRecordModal.propTypes = propTypes;
MineRecordModal.defaultProps = defaultProps;

export default MineRecordModal;
