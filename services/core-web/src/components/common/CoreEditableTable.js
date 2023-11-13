import React from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { isEmpty } from "lodash";
import { getNoticeOfWorkUnitTypeOptionsHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { Field, FieldArray } from "redux-form";
import { Button } from "antd";
import * as Strings from "@mds/common/constants/strings";
import { TRASHCAN } from "@/constants/assets";
import "@ant-design/compatible/assets/index.css";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  fieldName: PropTypes.string.isRequired,
  tableContent: PropTypes.objectOf(PropTypes.any).isRequired,
  fieldID: PropTypes.string.isRequired,
  type: PropTypes.string,
  unitTypeHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  type: "Activity",
};

const addActivity = (fields) => {
  fields.push({});
};

const removeActivity = (fields, index, fieldID) => {
  if (fields.get(index) && fields.get(index)[fieldID]) {
    // add state_modified and set to "delete" for backend
    fields.get(index).state_modified = "delete";

    // move updated object, this will cause rerendering of the react component, setTimeout is required to bypass react optimization
    setTimeout(() => {
      // eslint-disable-next-line no-constant-condition
      const res = fields.move(index, (index = 0 ? index + 1 : index - 1));
      return res;
    }, 1);
  } else {
    fields.remove(index);
  }
};

const renderActivities = ({ fields, isViewMode, tableContent, type, fieldID, unitTypeHash }) => {
  // resets deleted state if users decided to cancel their changes
  if (isViewMode && fields.length !== 0) {
    fields.getAll().forEach((activity) => {
      // eslint-disable-next-line no-prototype-builtins
      if (activity && activity.hasOwnProperty("state_modified")) {
        delete activity.state_modified;
      }
    });
  }

  const activeRecordsCount =
    fields.length !== 0 ? fields.getAll().filter((activity) => !activity.state_modified).length : 0;

  const renderViewField = (fieldObj, index, content) => {
    const activityObj = fieldObj.get(index);
    const value = activityObj[content.value] ?? "";
    if (content.hasUnit) {
      const unit = activityObj[`${content.value}_unit_type_code`]
        ? unitTypeHash[activityObj[`${content.value}_unit_type_code`]]
        : Strings.EMPTY_FIELD;
      return value ? `${value} ${unit}` : "";
    }
    if (content.dataHash && !isEmpty(content.dataHash)) {
      return content.dataHash[value];
    }
    return value;
  };

  return (
    <div>
      <div className="ant-table-wrapper" style={{ position: "relative", zIndex: 5 }}>
        <div className={`ant-table ${(!fields || fields.length <= 0) && "ant-table-empty"}`}>
          <div className="ant-table-content">
            <table style={{ tableLayout: "auto" }}>
              <thead className="ant-table-thead">
                <tr>
                  {tableContent.map(
                    ({ title, isUnit }) =>
                      (!isUnit || !isViewMode) && <th className="ant-table-cell">{title}</th>
                  )}
                  <th className="ant-table-cell" />
                </tr>
              </thead>
              <tbody className="ant-table-tbody">
                {activeRecordsCount > 0 &&
                  fields.map((activity, index) => {
                    const activityObj = fields.get(index);
                    const key = activityObj && (activityObj[fieldID] || index);
                    return (
                      (isViewMode || (activityObj && !activityObj.state_modified)) && (
                        <tr className="ant-table-row ant-table-row-level-0" key={key}>
                          {tableContent.map((content) => {
                            return isViewMode ? (
                              !content.isUnit && (
                                <td className="ant-table-cell">
                                  <div title={content.title}>
                                    {renderViewField(fields, index, content, tableContent)}
                                  </div>
                                </td>
                              )
                            ) : (
                              <td className="ant-table-cell">
                                <div title={content.title}>
                                  <Field
                                    name={`${activity}.${content.value}`}
                                    value={`${activity}.${content.value}`}
                                    component={content.component}
                                    disabled={isViewMode}
                                    validate={content.validate}
                                    data={content.data || []}
                                    minRows={content.minRows}
                                  />
                                </div>
                              </td>
                            );
                          })}
                          {!isViewMode && (
                            <td className="ant-table-cell">
                              <div name="remove" title="remove">
                                <Button
                                  type="primary"
                                  size="small"
                                  onClick={() => removeActivity(fields, index, fieldID)}
                                  ghost
                                >
                                  <img name="remove" src={TRASHCAN} alt="Remove Activity" />
                                </Button>
                              </div>
                            </td>
                          )}
                          {isViewMode && <td className="ant-table-cell" />}
                        </tr>
                      )
                    );
                  })}
                {activeRecordsCount <= 0 && (
                  <tr className="ant-table-placeholder">
                    <td colSpan="100%" className="ant-table-cell" style={{ color: "#bfbfbf" }}>
                      No Data Yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {!isViewMode && (
        <div>
          <Button type="primary" onClick={() => addActivity(fields)}>
            {`Add ${type}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export const CoreEditableTable = (props) => {
  return (
    <div>
      <FieldArray
        name={props.fieldName}
        component={renderActivities}
        rerenderOnEveryChange
        {...{
          isViewMode: props.isViewMode,
          tableContent: props.tableContent,
          type: props.type,
          fieldID: props.fieldID,
          unitTypeHash: props.unitTypeHash,
        }}
      />
    </div>
  );
};

CoreEditableTable.propTypes = propTypes;
CoreEditableTable.defaultProps = defaultProps;

export default connect(
  (state) => ({
    unitTypeHash: getNoticeOfWorkUnitTypeOptionsHash(state),
  }),
  null
)(CoreEditableTable);
