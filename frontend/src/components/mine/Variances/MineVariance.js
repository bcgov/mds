import React, { Component } from "react";
import PropTypes from "prop-types";
import MineVarianceTable from "./MineVarianceTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import AddButton from "@/components/common/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  variances: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  createVariance: PropTypes.func.isRequired,
  complianceCodes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

class MineVariance extends Component {
  handleAddVariances = (values) => {
    this.props.createVariance(values, this.props.mine.guid).then(() => {
      this.props.closeModal();
      this.props.fetchVariancesByMine(this.props.mine.guid);
    });
  };

  openVarianceModal(event) {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddVariances,
        title: ModalContent.ADD_VARIANCE(this.props.mine.mine_name),
        mineGuid: this.props.mine.guid,
        complianceCodes: this.props.complianceCodes,
      },
      widthSize: "75vw",
      content: modalConfig.ADD_VARIANCE,
    });
  }

  render() {
    return (
      <div>
        <div className="inline-flex flex-end">
          <AuthorizationWrapper permission={Permission.CREATE}>
            <AddButton onClick={(event) => this.openVarianceModal(event)}>
              Add a New Variance
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <br />
        <MineVarianceTable
          variances={this.props.variances}
          complianceCodesHash={this.props.complianceCodesHash}
        />
      </div>
    );
  }
}

MineVariance.propTypes = propTypes;

export default MineVariance;
