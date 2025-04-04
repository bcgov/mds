import React, { FC, useEffect, useState } from "react";
import queryString from "query-string";
import { useSelector } from "react-redux";
import { Divider } from "antd";
import { isEmpty } from "lodash";
import { formatParamStringToArray, formatDate, getFiscalYear } from "@common/utils/helpers";
import { fetchMineComplianceInfo } from "@mds/common/redux/actionCreators/complianceActionCreator";
import { getMultiSelectComplianceCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { getMineComplianceInfo } from "@mds/common/redux/selectors/complianceSelectors";
import { OVERDUEDOC, DOC } from "@/constants/assets";
import NullScreen from "@/components/common/NullScreen";
import * as routes from "@/constants/routes";
import ComplianceOrdersTable from "@/components/mine/Compliance/ComplianceOrdersTable";
import MineDashboardContentCard from "@/components/mine/MineDashboardContentCard";
import MineComplianceFilterForm from "@/components/mine/Compliance/MineComplianceFilterForm";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { useHistory, useParams } from "react-router-dom";

const initialSearchValues = {
  order_no: "",
  report_no: "",
  due_date: "",
  inspector: "",
  violation: [],
  order_status: "",
};

/**
 * @class  MineComplianceInfo - all compliance information related to the mine.
 */

const MineComplianceInfo: FC = () => {

  const [isLoaded, setIsLoaded] = useState(false);
  const [complianceFilterParams, setComplianceFilterParams] = useState(initialSearchValues);
  const [filteredOrders, setFilteredOrders] = useState([]);
  
  const history = useHistory();
  const dispatch = useAppDispatch();

  const { mineGuid } = useParams<{mineGuid: string}>();
  const mine = useAppSelector(getMineById(mineGuid));
  const mineComplianceInfo = useSelector(getMineComplianceInfo);
  const complianceCodes = useSelector(getMultiSelectComplianceCodes);

  useEffect(() => {
    dispatch(fetchMineComplianceInfo(mine.mine_no, true)).then(() => {
      setIsLoaded(true);
      setFilteredOrders(mineComplianceInfo.orders);
    });
  }, []); 

  useEffect(() => {
      const correctParams = location.search ? location.search : queryString.stringify(initialSearchValues);
      renderDataFromURL(correctParams);
      return () => {
        setComplianceFilterParams(initialSearchValues);
      };
  }, [location]);

  const renderDataFromURL = (params) => {
    const { violation, ...remainingParams } = queryString.parse(params);
    const formattedParams = {
      violation: formatParamStringToArray(violation),
      ...remainingParams,
    };
    const filteredOrders = mineComplianceInfo.orders?.filter((order) => handleFiltering(order, formattedParams));
    setFilteredOrders(filteredOrders);
    setComplianceFilterParams(formattedParams);
  };

  const handleFiltering = (order, params) => {
    const order_status = isEmpty(params.order_status) || order.order_status.includes(params.order_status);
    const inspector = isEmpty(params.inspector) || order.inspector.toLowerCase().includes(params.inspector.toLowerCase());
    const date = isEmpty(params.due_date) || (order.due_date !== null && order.due_date.includes(params.due_date));
    const orderNo = isEmpty(params.order_no) || order.order_no.includes(params.order_no);
    const reportNoString = order.report_no.toString();
    const reportNo = isEmpty(params.report_no) || reportNoString.includes(params.report_no);
    const violation = params.violation.length === 0 || params.violation.includes(order.violation);
    return order_status && inspector && date && orderNo && reportNo && violation;
  };

  const handleComplianceFilter = (values) => {
    if (isEmpty(values)) {
      history.push(routes.MINE_INSPECTIONS.dynamicRoute(mineGuid));
    } else {
      const { violation, ...rest } = values;
      history.push(
        routes.MINE_INSPECTIONS.dynamicRoute(mineGuid, {
          violation: violation && violation.join(","),
          ...rest,
        })
      );
    }
  };

  const renderComplianceContent = () => {
    const fiscalYear = getFiscalYear();
    return (
      <div>
        <div>
          <h4>COMPLIANCE OVERVIEW</h4>
          <Divider />
          <div className="compliance--container">
            <LoadingWrapper condition={isLoaded}>
              <div>
                {mineComplianceInfo && mineComplianceInfo.last_inspection ? (
                  <div className="dashboard--cards">
                    <MineDashboardContentCard
                      title="Inspections - Past 12 months"
                      content={mineComplianceInfo.last_12_months.num_inspections}
                    />
                    <MineDashboardContentCard
                      title={`Inspections - Since April 1, ${fiscalYear}`}
                      content={mineComplianceInfo.current_fiscal.num_inspections}
                    />
                    <MineDashboardContentCard
                      title="Last inspected"
                      content={formatDate(mineComplianceInfo.last_inspection)}
                    />
                    <MineDashboardContentCard
                      title="Last inspector (IDIR)"
                      content={mineComplianceInfo.last_inspector}
                    />
                    <MineDashboardContentCard
                      title="Open orders"
                      icon={DOC}
                      content={mineComplianceInfo.num_open_orders}
                    />
                    <MineDashboardContentCard
                      title="Overdue orders"
                      icon={OVERDUEDOC}
                      content={mineComplianceInfo.num_overdue_orders}
                    />
                    <MineDashboardContentCard
                      title="Warnings  - Past 12 months"
                      content={mineComplianceInfo.last_12_months.num_warnings}
                    />
                    <MineDashboardContentCard
                      title="Advisories - Past 12 months"
                      content={mineComplianceInfo.last_12_months.num_advisories}
                    />
                  </div>
                ) : (
                  <NullScreen type="compliance" />
                )}
              </div>
            </LoadingWrapper>
          </div>
          <div>
            <br />
            <h4>INSPECTION ORDERS</h4>
            <Divider />
            <div className="compliance-filter--content">
              <h4>Filter By</h4>
              <MineComplianceFilterForm
                complianceCodes={complianceCodes}
                onSubmit={handleComplianceFilter}
                initialValues={complianceFilterParams}
              />
            </div>
            <ComplianceOrdersTable
              filteredOrders={filteredOrders}
              isLoaded={isLoaded}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tab__content">
      <div>
        <h2>Inspections and Audits</h2>
        <Divider />
      </div>
      {renderComplianceContent()}
    </div>
  );
  
}

export default MineComplianceInfo;
