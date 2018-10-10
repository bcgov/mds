import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Card } from 'antd';
import AddTenureNumberForm from '@/components/Forms/AddTenureNumberForm';
import ConditionalButton from '@/components/common/ConditionalButton';
import NullScreen from '@/components/common/NullScreen'; 
/**
 * @class  MineTenureInfo - all tenure information related to the mine.
 */

const propTypes = {
  mine: PropTypes.object.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  getMineRecordById: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired
};

const defaultProps = {
  mine: {},
};

class MineTenureInfo extends Component {
  state = { visible: false }

  handleSubmit = (value) => {
    const { id } = this.props.match.params;
    this.props.updateMineRecord(this.props.mine.guid, value, this.props.mine.mine_detail[0].mine_name).then(() => {
      this.props.getMineRecordById(id);
      this.setState({
        visible: !this.state.visible,
      });
    })
  }

  toggleModal = () => {
    this.setState({
      visible: !this.state.visible,
    });
  }

  render() {
    const { mine } = this.props;

    if (mine.mineral_tenure_xref.length === 0) {
      return (
        <div>
          <NullScreen type="tenure" />
          <div className="center"><ConditionalButton handleAction={this.toggleModal} string="Add Tenure Number" type="primary" /></div>
          <Modal
            title="Add Tenure Number"
            visible={this.state.visible}
            footer={null}
            onCancel={this.toggleModal}
          >
            <AddTenureNumberForm onSubmit={this.handleSubmit} />
          </Modal>
        </div>
      )
    }
    return (
      <div>
        <Card>
          <table>
            <tr>
              <th scope="col"><h4>Tenure Numbers</h4></th>
            </tr>
            <tr>
              <td data-label="Tenure Numbers">
                {mine.mineral_tenure_xref.map((tenure) => {
                  return (
                    <p key={tenure.tenure_number_id} className="p-large">
                      {tenure.tenure_number_id}
                    </p>
                    )
                })}
              </td>
            </tr>
          </table>
          <div className="right center-mobile"><ConditionalButton handleAction={this.toggleModal} string="Add Tenure Number" type="primary" /></div>
        </Card>
        <Modal
          title="Add Tenure Number"
          visible={this.state.visible}
          footer={null}
          onCancel={this.toggleModal}
        >
          <AddTenureNumberForm onSubmit={this.handleSubmit} />
        </Modal>
      </div>
    );
  }
}

MineTenureInfo.propTypes = propTypes;
MineTenureInfo.defaultProps = defaultProps;
export default MineTenureInfo;