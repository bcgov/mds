import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { Button, List } from "antd";
import { PastMineAlert } from "@/components/mine/PastMineAlert";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  mineAlerts: CustomPropTypes.mineAlert.isRequired,
};

export const PastMineAlertList = (props) => {
  return (
    <>
      <div style={{ height: "300px", overflowY: "auto" }}>
        <List
          itemLayout="horizontal"
          dataSource={props.mineAlerts}
          locale={{ emptyText: "No Data Yet" }}
          renderItem={(item) => {
            return (
              <>
                <li key={item.key}>
                  <div className="inline-flex">
                    <div className="flex-4">
                      <PastMineAlert
                        start_date={item.start_date}
                        end_date={item.end_date}
                        message={item.message}
                        contact_name={item.contact_name}
                        contact_phone={item.contact_phone}
                      />
                    </div>
                  </div>
                </li>
                <br />
              </>
            );
          }}
        />
      </div>
      <div className="right center-mobile">
        <Button type="secondary" onClick={props.closeModal}>
          Close
        </Button>
      </div>
    </>
  );
};

PastMineAlertList.propTypes = propTypes;

export default PastMineAlertList;
