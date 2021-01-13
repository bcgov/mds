import React from "react";
import { shallow } from "enzyme";
import { ReviewApplicationFeeContent } from "@/components/noticeOfWork/applications/review/ReviewApplicationFeeContent";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const props = {};

const setupProps = () => {
  props.isViewMode = false;
  props.initialValues = {
    notice_of_work_type_code: "SAG",
    proposed_start_date: "2016-03-01",
    proposed_end_date: "2020-03-01",
    adjusted_annual_maximum_tonnage: null,
    proposed_annual_maximum_tonnage: 10000,
    ...NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
  };
  props.adjustedTonnage = null;
  props.proposedTonnage = 10000;
  props.proposedStartDate = "2016-03-01";
  props.proposedAuthorizationEndDate = "2020-03-01";
  props.change = () => {};
};

beforeEach(() => {
  setupProps();
});

describe("ReviewApplicationFeeContent", () => {
  it("renders properly", () => {
    const component = shallow(<ReviewApplicationFeeContent {...props} />);
    expect(component).toMatchSnapshot();
  });

  it("MIN: isApplicationFeeValid === true if `adjustedTonnage` is set and exceeds proposed tonnage for MIN", () => {
    const component = shallow(<ReviewApplicationFeeContent {...props} />);
    props.proposedTonnage = 50000;
    props.adjustedTonnage = 60000;
    props.initialValues.notice_of_work_type_code = "MIN";
    component.update();
    const instance = component.instance();
    const setIsApplicationFeeValidSpy = jest.spyOn(instance, "setIsApplicationFeeValid");
    const adjustmentExceedsFeeSpy = jest.spyOn(instance, "adjustmentExceedsFeePitsQuarries");
    instance.setIsApplicationFeeValid(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(adjustmentExceedsFeeSpy).not.toHaveBeenCalledWith(
      props.proposedTonnage,
      props.adjustedTonnage
    );
    expect(setIsApplicationFeeValidSpy).toHaveBeenCalledWith(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(instance.state.isApplicationFeeValid).toEqual(true);
    expect(component.find(".error").length).toEqual(0);
  });

  it("S&G: isApplicationFeeValid === true if `adjustedTonnage` is not set for S&G", () => {
    const component = shallow(<ReviewApplicationFeeContent {...props} />);
    const instance = component.instance();
    const setIsApplicationFeeValidSpy = jest.spyOn(instance, "setIsApplicationFeeValid");
    const adjustmentExceedsFeeSpy = jest.spyOn(instance, "adjustmentExceedsFeePitsQuarries");
    instance.adjustmentExceedsFeePitsQuarries(props.proposedTonnage, props.adjustedTonnage);
    instance.setIsApplicationFeeValid(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(setIsApplicationFeeValidSpy).toHaveBeenCalledWith(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(adjustmentExceedsFeeSpy).toHaveBeenCalledWith(
      props.proposedTonnage,
      props.adjustedTonnage
    );
    expect(instance.state.isApplicationFeeValid).toEqual(true);
    expect(component.find(".error").length).toEqual(0);
  });

  it("S&G: isApplicationFeeValid === true if `adjustedTonnage` is set and does not exceeds proposed tonnage range for S&G", () => {
    props.proposedTonnage = 4000;
    props.adjustedTonnage = 4500;
    const component = shallow(<ReviewApplicationFeeContent {...props} />);
    const instance = component.instance();
    const setIsApplicationFeeValidSpy = jest.spyOn(instance, "setIsApplicationFeeValid");
    const adjustmentExceedsFeeSpy = jest.spyOn(instance, "adjustmentExceedsFeePitsQuarries");
    instance.adjustmentExceedsFeePitsQuarries(props.proposedTonnage, props.adjustedTonnage);
    instance.setIsApplicationFeeValid(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(setIsApplicationFeeValidSpy).toHaveBeenCalledWith(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(adjustmentExceedsFeeSpy).toHaveBeenCalledWith(
      props.proposedTonnage,
      props.adjustedTonnage
    );
    expect(instance.state.isApplicationFeeValid).toEqual(true);
    expect(component.find(".error").length).toEqual(0);
  });

  it("S&G: isApplicationFeeValid === false if `adjustedTonnage` is set and exceeds proposed tonnage range for S&G", () => {
    props.proposedTonnage = 10000;
    props.adjustedTonnage = 21000;
    props.initialValues.notice_of_work_type_code = "SAG";
    const component = shallow(<ReviewApplicationFeeContent {...props} />);
    const instance = component.instance();
    const setIsApplicationFeeValidSpy = jest.spyOn(instance, "setIsApplicationFeeValid");
    const adjustmentExceedsFeeSpy = jest.spyOn(instance, "adjustmentExceedsFeePitsQuarries");
    instance.adjustmentExceedsFeePitsQuarries(props.proposedTonnage, props.adjustedTonnage);
    instance.setIsApplicationFeeValid(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(setIsApplicationFeeValidSpy).toHaveBeenCalledWith(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(adjustmentExceedsFeeSpy).toHaveBeenCalledWith(
      props.proposedTonnage,
      props.adjustedTonnage
    );
    expect(instance.state.isApplicationFeeValid).toEqual(false);
    expect(component.find(".error").length).toEqual(1);
  });

  it("PLA: isApplicationFeeValid === true if `adjustedTonnage` is set and does not exceed proposed tonnage range for PLA < 5 years", () => {
    props.proposedTonnage = 50000;
    props.adjustedTonnage = 55000;
    props.initialValues.notice_of_work_type_code = "PLA";
    const component = shallow(<ReviewApplicationFeeContent {...props} />);
    const instance = component.instance();
    const setIsApplicationFeeValidSpy = jest.spyOn(instance, "setIsApplicationFeeValid");
    const adjustmentExceedsFeeSpy = jest.spyOn(instance, "adjustmentExceedsFeePlacer");
    instance.adjustmentExceedsFeePlacer(props.proposedTonnage, props.adjustedTonnage);
    instance.setIsApplicationFeeValid(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(setIsApplicationFeeValidSpy).toHaveBeenCalledWith(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(adjustmentExceedsFeeSpy).toHaveBeenCalledWith(
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(instance.state.isApplicationFeeValid).toEqual(true);
    expect(component.find(".error").length).toEqual(0);
  });

  it("PLA: isApplicationFeeValid === true if `adjustedTonnage` is set and does not exceed proposed tonnage range for PLA > 5 years", () => {
    props.proposedTonnage = 50000;
    props.adjustedTonnage = 55000;
    props.initialValues.notice_of_work_type_code = "PLA";
    const component = shallow(<ReviewApplicationFeeContent {...props} />);
    const instance = component.instance();
    const setIsApplicationFeeValidSpy = jest.spyOn(instance, "setIsApplicationFeeValid");
    const adjustmentExceedsFeeSpy = jest.spyOn(instance, "adjustmentExceedsFeePlacer");
    instance.adjustmentExceedsFeePlacer(props.proposedTonnage, props.adjustedTonnage);
    instance.setIsApplicationFeeValid(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(setIsApplicationFeeValidSpy).toHaveBeenCalledWith(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(adjustmentExceedsFeeSpy).toHaveBeenCalledWith(
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(instance.state.isApplicationFeeValid).toEqual(true);
    expect(component.find(".error").length).toEqual(0);
  });

  it("PLA: isApplicationFeeValid === false if `adjustedTonnage` is set and exceeds proposed tonnage range for PLA > 5 years", () => {
    props.proposedTonnage = 10000;
    props.adjustedTonnage = 70000;
    props.proposedStartDate = "2019-03-01";
    props.proposedAuthorizationEndDate = "2025-03-01";
    props.initialValues.notice_of_work_type_code = "PLA";
    const component = shallow(<ReviewApplicationFeeContent {...props} />);
    const instance = component.instance();
    const setIsApplicationFeeValidSpy = jest.spyOn(instance, "setIsApplicationFeeValid");
    const adjustmentExceedsFeeSpy = jest.spyOn(instance, "adjustmentExceedsFeePlacer");
    instance.adjustmentExceedsFeePlacer(props.proposedTonnage, props.adjustedTonnage);
    instance.setIsApplicationFeeValid(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(setIsApplicationFeeValidSpy).toHaveBeenCalledWith(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(adjustmentExceedsFeeSpy).toHaveBeenCalledWith(
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(instance.state.isApplicationFeeValid).toEqual(false);
    expect(component.find(".error").length).toEqual(1);
  });

  it("PLA: isApplicationFeeValid === false if `adjustedTonnage` is set and exceeds proposed tonnage range for PLA < 5 years", () => {
    props.proposedTonnage = 60000;
    props.adjustedTonnage = 135000;
    props.initialValues.notice_of_work_type_code = "PLA";
    const component = shallow(<ReviewApplicationFeeContent {...props} />);
    const instance = component.instance();
    const setIsApplicationFeeValidSpy = jest.spyOn(instance, "setIsApplicationFeeValid");
    const adjustmentExceedsFeeSpy = jest.spyOn(instance, "adjustmentExceedsFeePlacer");
    instance.adjustmentExceedsFeePlacer(props.proposedTonnage, props.adjustedTonnage);
    instance.setIsApplicationFeeValid(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(setIsApplicationFeeValidSpy).toHaveBeenCalledWith(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(adjustmentExceedsFeeSpy).toHaveBeenCalledWith(
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(instance.state.isApplicationFeeValid).toEqual(false);
    expect(component.find(".error").length).toEqual(1);
  });

  it("PLA: isDateRangeValid === true if start_date preceeds end_date PLA", () => {
    props.proposedTonnage = 50000;
    props.adjustedTonnage = 60000;
    props.proposedAuthorizationEndDate = "2014-03-01";
    props.initialValues.notice_of_work_type_code = "PLA";
    const component = shallow(<ReviewApplicationFeeContent {...props} />);
    const instance = component.instance();
    const setIsApplicationFeeValidSpy = jest.spyOn(instance, "setIsApplicationFeeValid");
    const adjustmentExceedsFeeSpy = jest.spyOn(instance, "adjustmentExceedsFeePlacer");
    instance.adjustmentExceedsFeePlacer(props.proposedTonnage, props.adjustedTonnage);
    instance.setIsApplicationFeeValid(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(setIsApplicationFeeValidSpy).toHaveBeenCalledWith(
      props.initialValues.notice_of_work_type_code,
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(adjustmentExceedsFeeSpy).toHaveBeenCalledWith(
      props.proposedTonnage,
      props.adjustedTonnage,
      props.proposedStartDate,
      props.proposedAuthorizationEndDate
    );
    expect(instance.state.isDateRangeValid).toEqual(false);
    expect(component.find(".error").length).toEqual(1);
  });
});
