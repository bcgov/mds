import { getIsModalOpen, getProps, getContent } from "@mds/common/redux/selectors/modalSelectors";
import { modalReducer } from "@mds/common/redux/reducers/modalReducer";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { MODAL } from "@mds/common/constants/reducerTypes";
import * as Mock from "@/tests/mocks/dataMocks";
import { modalConfig } from "@/components/modalContent/config";

const mockModal = {
  isModalOpen: true,
  props: [Mock.MINES.mines[Mock.MINES.mineIds[0]], Mock.REGION_OPTIONS, Mock.STATUS_OPTIONS],
  content: modalConfig.MINE_RECORD,
};

describe("modalSelectors", () => {
  const { props, content } = mockModal;

  it("`getIsModalOpen` calls `modalReducer.getIsModalOpen` when `openModal` is dispatched", () => {
    const storeAction = openModal({ props, content });
    const storeState = modalReducer({}, storeAction);
    const mockState = {
      [MODAL]: storeState,
    };
    expect(getIsModalOpen(mockState)).toEqual(true);
  });

  it("`getIsModalOpen` calls `modalReducer.getIsModalOpen` when `closeModal` is dispatched", () => {
    const storeAction = closeModal();
    const storeState = modalReducer({}, storeAction);
    const mockState = {
      [MODAL]: storeState,
    };
    expect(getIsModalOpen(mockState)).toEqual(false);
  });

  it("`getProps` calls `modalReducer.getProps`", () => {
    const storeAction = openModal({ props, content });
    const storeState = modalReducer({}, storeAction);
    const mockState = {
      [MODAL]: storeState,
    };
    expect(getProps(mockState)).toEqual([
      Mock.MINES.mines[Mock.MINES.mineIds[0]],
      Mock.REGION_OPTIONS,
      Mock.STATUS_OPTIONS,
    ]);
  });

  it("`getContent` calls `modalReducer.getContent`", () => {
    const storeAction = openModal({ props, content });
    const storeState = modalReducer({}, storeAction);
    const mockState = {
      [MODAL]: storeState,
    };
    expect(getContent(mockState)).toEqual(modalConfig.MINE_RECORD);
  });
});
