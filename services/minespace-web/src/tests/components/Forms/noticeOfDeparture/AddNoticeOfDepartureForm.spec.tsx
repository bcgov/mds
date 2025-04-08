import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import AddNoticeOfDepartureForm from "@/components/Forms/noticeOfDeparture/AddNoticeOfDepartureForm";
import { store } from "@/App";

describe("AddNoticeOfDepartureForm", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <AddNoticeOfDepartureForm
          mineGuid={MOCK.MINES.mineIds[0]}
          permits={MOCK.PERMITS.map((p) => ({ ...p, amendments: [] }))}
          onSubmit={jest.fn()}
        />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
