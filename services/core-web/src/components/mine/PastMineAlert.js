import React from "react";
import PropTypes from "prop-types";
import { formatDate } from "@common/utils/helpers";
import { Alert, Col, Row } from "antd";

const propTypes = {
  end_date: PropTypes.string.isRequired,
  start_date: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  contact_name: PropTypes.string.isRequired,
  contact_phone: PropTypes.string.isRequired,
};

export const PastMineAlert = (props) => {
  return (
    <div>
      <Alert
        description={
          <Row>
            <Col xs={24} md={18}>
              <>
                <p>
                  {props.end_date ? (
                    <b>
                      {`Active Alert: ${formatDate(props.start_date)} - ${formatDate(
                        props.end_date
                      )}`}
                    </b>
                  ) : (
                    <b>{`Active Alert: ${formatDate(props.start_date)}`}</b>
                  )}
                </p>
                <p>
                  {props.message}
                  <br />
                  For more information contact: {props.contact_name} - {props.contact_phone}
                </p>
              </>
            </Col>
          </Row>
        }
        type="warning"
        showIcon
        style={{ backgroundColor: "#FFF2F0", border: "1.5px solid #FF0000" }}
        className="ant-alert-warning ant-alert-warning-custom-with-red-icon"
      />
    </div>
  );
};

PastMineAlert.propTypes = propTypes;

export default PastMineAlert;
