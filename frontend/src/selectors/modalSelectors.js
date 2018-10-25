import * as modalReducer from '@/reducers/modalReducer';

export const getIsModalOpen = (state) => modalReducer.getIsModalOpen(state);
export const getProps = (state) => modalReducer.getProps(state);
export const getContent = (state) => modalReducer.getContent(state);