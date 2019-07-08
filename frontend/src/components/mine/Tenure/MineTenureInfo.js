import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, Button } from "antd";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import NullScreen from "@/components/common/NullScreen";
import * as ModalContent from "@/constants/modalContent";
import * as Permission from "@/constants/permissions";
import { modalConfig } from "@/components/modalContent/config";
/**
 * @class  MineTenureInfo - all tenure information related to the mine.
 */

const propTypes = {
  mine: PropTypes.objectOf(PropTypes.any).isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

class MineTenureInfo extends Component {
  handleSubmit = (value) => {
    const { id } = this.props.match.params;
    return this.props
      .updateMineRecord(this.props.mine.mine_guid, value, this.props.mine.mine_name)
      .then(() => {
        this.props.fetchMineRecordById(id);
        this.props.closeModal();
      });
  };

  openModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title },
      content: modalConfig.ADD_TENURE,
    });
  }

  render() {
    if (this.props.mine.mineral_tenure_xref.length === 0) {
      return (
        <div>
          <NullScreen type="tenure" />
          <div className="center">
            <AuthorizationWrapper
              permission={Permission.EDIT_MINES}
              isMajorMine={this.props.mine.major_mine_ind}
            >
              <Button
                type="primary"
                onClick={(event) =>
                  this.openModal(event, this.handleSubmit, ModalContent.ADD_TENURE)
                }
              >
                {ModalContent.ADD_TENURE}
              </Button>
            </AuthorizationWrapper>
          </div>
        </div>
      );
    }
    return (
      <div>
        <Card>
          <table>
            <tbody>
              <tr>
                <th scope="col">
                  <h2>Tenure Numbers</h2>
                </th>
              </tr>
              <tr>
                <td data-label="Tenure Numbers">
                  {this.props.mine.mineral_tenure_xref.map((tenure) => (
                    <p key={tenure.tenure_number_id} className="p-large">
                      {tenure.tenure_number_id}
                    </p>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="right center-mobile">
            <AuthorizationWrapper
              permission={Permission.EDIT_MINES}
              isMajorMine={this.props.mine.major_mine_ind}
            >
              <Button
                type="primary"
                onClick={(event) =>
                  this.openModal(event, this.handleSubmit, ModalContent.ADD_TENURE)
                }
              >
                {ModalContent.ADD_TENURE}
              </Button>
            </AuthorizationWrapper>
          </div>
        </Card>
      </div>
    );
  }
}

MineTenureInfo.propTypes = propTypes;
export default MineTenureInfo;
