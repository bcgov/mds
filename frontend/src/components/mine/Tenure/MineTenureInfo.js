import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card } from "antd";
import ConditionalButton from "@/components/common/ConditionalButton";
import NullScreen from "@/components/common/NullScreen";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
/**
 * @class  MineTenureInfo - all tenure information related to the mine.
 */

const propTypes = {
  mine: PropTypes.object.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
};

const defaultProps = {
  mine: {},
};

class MineTenureInfo extends Component {
  handleSubmit = (value) => {
    const { id } = this.props.match.params;
    this.props.updateMineRecord(this.props.mine.guid, value, this.props.mine.mine_name).then(() => {
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
    const { mine } = this.props;
    if (mine.mineral_tenure_xref.length === 0) {
      return (
        <div>
          <NullScreen type="tenure" />
          <div className="center">
            <ConditionalButton
              handleAction={(event) =>
                this.openModal(event, this.handleSubmit, ModalContent.ADD_TENURE)
              }
              string={ModalContent.ADD_TENURE}
              type="primary"
            />
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
                  <h4>Tenure Numbers</h4>
                </th>
              </tr>
              <tr>
                <td data-label="Tenure Numbers">
                  {mine.mineral_tenure_xref.map((tenure) => (
                    <p key={tenure.tenure_number_id} className="p-large">
                      {tenure.tenure_number_id}
                    </p>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="right center-mobile">
            <ConditionalButton
              handleAction={(event) =>
                this.openModal(event, this.handleSubmit, ModalContent.ADD_TENURE)
              }
              string={ModalContent.ADD_TENURE}
              type="primary"
            />
          </div>
        </Card>
      </div>
    );
  }
}

MineTenureInfo.propTypes = propTypes;
MineTenureInfo.defaultProps = defaultProps;
export default MineTenureInfo;
