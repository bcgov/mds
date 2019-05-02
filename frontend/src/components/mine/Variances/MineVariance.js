import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Divider } from "antd";
import MineVarianceTable from "./MineVarianceTable";
import MineVarianceApplicationTable from "./MineVarianceApplicationTable";
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
  addDocumentToVariance: PropTypes.func.isRequired,
  complianceCodes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  fetchVariancesByMine: PropTypes.func.isRequired,
  coreUsers: CustomPropTypes.dropdownListItem.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  varianceStatusOptions: CustomPropTypes.dropdownListItem.isRequired,
};

export class MineVariance extends Component {
  handleAddVariances = (files) => (values) => {
    const received_date = values.received_date
      ? values.received_date
      : moment().format("YYYY-MM-DD");
    const newValues = { received_date, ...values };
    return this.props
      .createVariance({ mineGuid: this.props.mine.mine_guid }, newValues)
      .then(async ({ data: { variance_id } }) => {
        await Promise.all(
          Object.entries(files).map(([document_manager_guid, document_name]) =>
            this.props.addDocumentToVariance(
              { mineGuid: this.props.mine.mine_guid, varianceId: variance_id },
              {
                document_manager_guid,
                document_name,
              }
            )
          )
        );
        this.props.closeModal();
        this.props.fetchVariancesByMine({ mineGuid: this.props.mine.mine_guid });
      });
  };

  openViewVarianceModal = (event, variance) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddVariances,
        title: this.props.mine.mine_name,
        mineGuid: this.props.mine.mine_guid,
        mineName: this.props.mine.mine_name,
        variance,
        coreUsers: this.props.coreUsers,
        varianceStatusOptions: this.props.varianceStatusOptions,
      },
      content: modalConfig.VIEW_VARIANCE,
    });
  };

  openVarianceModal(event) {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddVariances,
        title: ModalContent.ADD_VARIANCE(this.props.mine.mine_name),
        mineGuid: this.props.mine.mine_guid,
        complianceCodes: this.props.complianceCodes,
      },
      content: modalConfig.ADD_VARIANCE,
    });
  }

  render() {
    return (
      <div>
        <div className="inline-flex flex-end">
          <AuthorizationWrapper permission={Permission.CREATE}>
            <AddButton onClick={(event) => this.openVarianceModal(event)}>
              Add variance application
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <br />
        <h4 className="uppercase">Variance Applications</h4>
        <Divider />
        <MineVarianceApplicationTable
          openViewVarianceModal={this.openViewVarianceModal}
          variances={this.props.variances}
          complianceCodesHash={this.props.complianceCodesHash}
          mine={this.props.mine}
        />
        <h4 className="uppercase">Approved Variances</h4>
        <Divider />
        <MineVarianceTable
          openViewVarianceModal={this.openViewVarianceModal}
          variances={this.props.variances}
          complianceCodesHash={this.props.complianceCodesHash}
          mine={this.props.mine}
        />
      </div>
    );
  }
}

MineVariance.propTypes = propTypes;

export default MineVariance;
