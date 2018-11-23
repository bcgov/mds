import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import LoadingBar from 'react-redux-loading-bar'
import { closeModal } from '@/actions/modalActions';
import { getIsModalOpen, getProps, getContent, getClearOnSubmit } from "@/selectors/modalSelectors";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  content: PropTypes.func,
  props: PropTypes.object,
  clearOnSubmit: PropTypes.bool,
};

const defaultProps = {
  props: {
    title: ''
  },
};

export class ModalWrapper extends Component {

  render() {
    const { isModalOpen, content: ChildComponent, props, closeModal, clearOnSubmit } = this.props;
    return (
    <Modal
      title={props.title}
      visible={isModalOpen}
      closable={false}
      footer={null}
    >
      <LoadingBar 
        scope="modal" 
        style={{ position: 'absolute', top: '50px', left: 0, backgroundColor: '#77510a', width: '100%', height: '8px', zIndex: 100 }} 
      />
     {ChildComponent &&
        <ChildComponent
          closeModal={closeModal}
          clearOnSubmit={clearOnSubmit}
          {...props}
        />
      }
    </Modal>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isModalOpen: getIsModalOpen(state),
    props: getProps(state),
    content: getContent(state),
    clearOnSubmit: getClearOnSubmit(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    closeModal,
  }, dispatch);
};

ModalWrapper.propTypes = propTypes;
ModalWrapper.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ModalWrapper);
