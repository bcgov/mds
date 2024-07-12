import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Radio, Divider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {
  createParty,
  setAddPartyFormState,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { getAddPartyFormState } from "@mds/common/redux/selectors/partiesSelectors";
import AddQuickPartyForm from "@/components/Forms/parties/AddQuickPartyForm";
import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import LinkButton from "../buttons/LinkButton";
import { closeModal } from "@mds/common/redux/actions/modalActions";

const defaultAddPartyFormState = {
  showingAddPartyForm: false,
  person: true,
  organization: true,
  partyLabel: "contact",
};

interface AddPartyComponentWrapperProps {
  childProps: any;
  content: React.ComponentType;
  initialValues?: any;
}

const AddPartyComponentWrapper: FC<AddPartyComponentWrapperProps> = ({ childProps, content }) => {
  const [isPerson, setIsPerson] = useState(true);
  const [addingParty, setAddingParty] = useState(false);

  const dispatch = useDispatch();
  const addPartyFormState = useSelector(getAddPartyFormState);
  const provinceOptions = useSelector(getDropdownProvinceOptions);

  const { title = "" } = childProps;

  const resetAddPartyForm = () => {
    dispatch(
      setAddPartyFormState({
        ...addPartyFormState,
        ...defaultAddPartyFormState,
      })
    );
  };

  const showAddPartyForm = () => {
    // If focus remains active in the parent form, Carousel behavior breaks.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setAddingParty(true);
  };
  const hideAddPartyForm = () => {
    // If focus remains active in the party form, Carousel behavior breaks.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setAddingParty(false);
  };

  useEffect(() => {
    resetAddPartyForm();
  }, []);

  useEffect(() => {
    if (addPartyFormState.showingAddPartyForm) {
      showAddPartyForm();
    } else {
      hideAddPartyForm();
    }
  }, [addPartyFormState.showingAddPartyForm]);

  const handlePartySubmit = (values) => {
    const party_type_code = isPerson ? "PER" : "ORG";
    const payload = { party_type_code, ...values };
    dispatch(createParty(payload))
      .then(() => resetAddPartyForm())
      .catch();
  };

  const togglePartyChange = (event) => {
    setIsPerson(event.target.value);
  };

  const renderAddParty = () => (
    <div>
      <h2>Add new {addPartyFormState.partyLabel}</h2>
      <LinkButton onClick={resetAddPartyForm}>
        <ArrowLeftOutlined className="padding-sm--right" />
        Back to: {title}
      </LinkButton>
      <Divider />
      <div className="center">
        {addPartyFormState.person && addPartyFormState.organization && (
          <Radio.Group
            defaultValue
            size="large"
            value={isPerson}
            onChange={togglePartyChange}
            style={{ paddingBottom: "20px" }}
          >
            <Radio.Button value>Person</Radio.Button>
            <Radio.Button value={false}>Organization</Radio.Button>
          </Radio.Group>
        )}
        <AddQuickPartyForm
          onSubmit={handlePartySubmit}
          isPerson={isPerson}
          provinceOptions={provinceOptions}
        />
      </div>
    </div>
  );

  const ChildComponent = content;
  return (
    <div>
      <Carousel
        selectedItem={addingParty ? 1 : 0}
        showArrows={false}
        showStatus={false}
        showIndicators={false}
        showThumbs={false}
        swipeable={false}
      >
        {/* Set original form to display:none to preserve its state, while not allowing any interaction such as tabbing to the hidden form. */}
        <div style={addingParty ? { display: "none" } : {}}>
          {ChildComponent && (
            <div className="fade-in">
              <ChildComponent closeModal={() => dispatch(closeModal())} {...childProps} />
            </div>
          )}
        </div>
        <div>{addingParty && renderAddParty()}</div>
      </Carousel>
    </div>
  );
};

export default AddPartyComponentWrapper;
