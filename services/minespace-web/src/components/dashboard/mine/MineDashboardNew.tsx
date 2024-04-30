import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { IMine } from "@mds/common/interfaces";
import { MINE_DASHBOARD } from "@/constants/routes";
import { getMineDashboardRoutes } from "./MineDashboardRoutes";
import SidebarWrapper, { SidebarNavigation } from "@mds/common/components/common/SidebarWrapper";
import Loading from "@/components/common/Loading";
import { fetchEMLIContactsByRegion } from "@mds/common/redux/actionCreators/minespaceActionCreator";
import { fetchPartyRelationships } from "@mds/common/redux/actionCreators/partiesActionCreator";
import NotFoundNotice from "@/components/common/NotFoundNotice";

const MineDashboardNew = () => {
  const dispatch = useDispatch();
  const { id, activeTab } = useParams<{ id: string; activeTab: string }>();
  const mine: IMine = useSelector((state) => getMineById(state, id));
  const defaultIsLoadedValue: boolean = mine?.mine_guid === id;
  const [isLoaded, setIsLoaded] = useState(defaultIsLoadedValue);
  const [mineNotFound, setMineNotFound] = useState(false);

  const loadData = async (mine_guid) => {
    return Promise.all([
      dispatch(fetchMineRecordById(mine_guid))
        .then(({ data }) => {
          dispatch(fetchEMLIContactsByRegion(data.mine_region, data.major_mine_ind));
        })
        .catch(() => setMineNotFound(true)),
      dispatch(
        fetchPartyRelationships({
          mine_guid,
          relationships: "party",
          include_permit_contacts: "true",
        })
      ),
    ]);
  };
  useEffect(() => {
    if (!mine || mine.mine_guid !== id) {
      setIsLoaded(false);
      loadData(id).then(() => setIsLoaded(true));
    }
  }, [id]);

  const dynamicRoute = (key: string) => {
    return MINE_DASHBOARD.dynamicRoute(mine?.mine_guid, key);
  };
  const items = getMineDashboardRoutes(mine?.major_mine_ind).map((item) => ({
    ...item,
    path: dynamicRoute(item.key),
  }));
  const sharedData = { mine };
  const selectedKeys = [activeTab];

  if (mineNotFound) {
    return <NotFoundNotice />;
  }
  return isLoaded ? (
    <SidebarWrapper items={items} sharedData={sharedData}>
      <div className="sidebar-header">
        <div className="primary-colour">
          <b>{mine.mine_name}</b>
        </div>
        <div>Mine number: {mine.mine_no}</div>
      </div>
      <SidebarNavigation items={items} selectedKeys={selectedKeys} />
    </SidebarWrapper>
  ) : (
    <Loading />
  );
};

export interface MineDashboardContext {
  mine: IMine;
}

export default MineDashboardNew;
