import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon, Button } from "antd";
import MineVarianceTable from "./MineVarianceTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  createVariance: PropTypes.func.isRequired,
  fetchVariancesById: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

class MineVariance extends Component {
  handleAddVariances = (value) => {
    this.props.createVariance(value, this.props.mine.guid).then(() => {
      this.props.closeModal();
      this.props.fetchVariancesById(this.props.mine.guid);
    });
  };

  openVarianceModal(event) {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddVariances,
        title: ModalContent.ADD_VARIANCE(this.props.mine.mine_name),
      },
      content: modalConfig.ADD_VARIANCE,
      widthSize: "75vw",
    });
  }

  render() {
    return (
      <div>
        <div className="inline-flex flex-end">
          <AuthorizationWrapper inDevelopment>
            <AuthorizationWrapper permission={Permission.CREATE}>
              <Button type="primary" onClick={(event) => this.openVarianceModal(event)}>
                <Icon type="plus" theme="outlined" style={{ fontSize: "18px" }} />
                Add New Variance
              </Button>
            </AuthorizationWrapper>
          </AuthorizationWrapper>
        </div>
        <br />
        <MineVarianceTable />
      </div>
    );
  }
}

MineVariance.propTypes = propTypes;

export default MineVariance;
