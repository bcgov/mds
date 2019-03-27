/* eslint-disable  */
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
      },
      widthSize: "75vw",
      content: modalConfig.ADD_VARIANCE,
    });
  }

  render() {
    const variancePayload = {
      data: [
        {
          variance_id: 1249,
          compliance_article_id: 1,
          expiry_date: "2019-03-30",
          issue_date: "2019-03-01",
          note: "notesss",
          received_date: "2019-03-01",
        },
        {
          variance_id: 59285,
          compliance_article_id: 1,
          expiry_date: "2028-03-25",
          issue_date: "2019-03-06",
          note: "this is a variance",
          received_date: "2019-03-10",
        },
        {
          compliance_article_id: 1,
          variance_id: 5545486,
          expiry_date: "2019-03-04",
          issue_date: "2016-03-06",
          received_date: "2015-03-03",
        },
      ],
    };
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
        <MineVarianceTable variances={variancePayload} />
      </div>
    );
  }
}

MineVariance.propTypes = propTypes;

export default MineVariance;
