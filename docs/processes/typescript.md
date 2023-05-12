# Typescript Conversion

## Notes on Converting .js files to .ts/.tsx (Or adding new ones)

### Interfaces

- Interfaces are used to define the shape of an object
- Interfaces can be created in the common package and imported in Minespace/Core through the '@mds/common' alias
- Interfaces can be organized by section of the codebase with common interfaces in the base interfaces folder
- Make sure to update the index.ts file in the interfaces folder to export any new interfaces
- Interfaces will be recognized in Minespace/Core only once you have run either build or watch in the common package

---

### enums

- enums are used to define a set of named constants
- Where possible try to replace existing objects with enums
- enums can be created in the common package and imported in Minespace/Core through the '@mds/common' alias

---

### propTypes

- propTypes are not required in .ts/.tsx files
- these are to be replaced with interfaces
  - Use the existing propTypes as a guide.
    - Delete the propTypes once the interface is created/implemented.
  - interfaces for props are defined in the same file as the component since they are generally single use
  - ```typescript
    interface Props {
      name: string;
      age: number;
    }
    ```
    - the above interface is used in the component as follows:
    - ```typescript
      const MyComponent: React.FC<Props> = (props) => {
        const { name, age } = props;
        return (
          <div>
            <p>{name}</p>
            <p>{age}</p>
          </div>
        );
      };
      ```

---

# Redux

Redux has a number of difficult interactions with Typescript. The following are some discoveries and notes on how to handle them.

---

### Reducers

- A RootState type is exported from the App.tsx of each service.
  - This grabs the actual shape of the redux state.
  - This is used in the reducer to define the state type.
    - ```typescript
      import { RootState } from "@/App";
      export const getNoticeOfDeparture = (state: RootState): INoticeOfDeparture =>
        state[NOTICES_OF_DEPARTURE].noticeOfDeparture;
      ```
- Individual Reducers can have their own interfaces defined within the reducer

  - ```typescript
    interface NoDState {
      nods: INoticeOfDeparture[];
      noticeOfDeparture: INoticeOfDeparture | Record<string, never>;
    }

    const initialState: NoDState = {
      nods: [],
      noticeOfDeparture: {},
    };
    ```

---

### Action Creators

The return types of action creators are complicated because they work as nested arrow functions.
As such, a special `AppThunk` type has been created that incorporates the `ThunkAction` type from redux-thunk as well as the custom RootState type.

AppThunk can be used as follows:

```typescript
export const fetchNoticeOfDeparture =
  (id: number): AppThunk =>
  async (dispatch) => {
    dispatch(fetchNoticeOfDepartureRequest());
    try {
      const response = await fetch(`${API_URL}/notice-of-departures/${id}`);
      const data = await response.json();
      dispatch(fetchNoticeOfDepartureSuccess(data));
    } catch (error) {
      dispatch(fetchNoticeOfDepartureFailure(error));
    }
  };
```

Calling it as it's base type assumes you are not returning anything from the thunk.

---

```typescript
export const fetchDetailedNoticeOfDeparture = (
  nod_guid
): AppThunk<Promise<AxiosResponse<INoticeOfDeparture>>> => {
  return async (dispatch): Promise<AxiosResponse<INoticeOfDeparture>> => {
    dispatch(request(GET_DETAILED_NOTICE_OF_DEPARTURE));
    dispatch(showLoading());
    try {
      try {
        const response: AxiosResponse<INoticeOfDeparture> = await CustomAxios().get(
          `${ENVIRONMENT.apiUrl}${NOTICE_OF_DEPARTURE(nod_guid)}`,
          createRequestHeader()
        );
        dispatch(success(GET_DETAILED_NOTICE_OF_DEPARTURE));
        dispatch(storeNoticeOfDeparture(response.data));
        return response;
      } catch {
        dispatch(error(GET_DETAILED_NOTICE_OF_DEPARTURE));
      }
    } finally {
      dispatch(hideLoading());
    }
  };
};
```

AppThunk can also be passed a return type if you are returning something from the thunk.
In the above example, the thunk returns a promise of `<AxiosResponse<INoticeOfDeparture>>`.

**Note:** _You also need to set the return type of the inner dispatch function to the same type as the thunk return type._

### Forms

There are a couple of tricky things to note when converting redux-forms to typescript.

- The component type looks a little different from a normal component:
  - ```typescript
    const AddNoticeOfDepartureForm: React.FC<InjectedFormProps<ICreateNoD> & AddNoticeOfDepartureProps>
    = (props) => {...}
    ```
    - The `InjectedFormProps` type is imported from redux-form.
    - The `AddNoticeOfDepartureProps` are the component's base props
    - `ICreateNod` is the interface for the form values.
      - This is used to type the `values` prop of the form.
- The export of the component also requires a slight change since the redux HOCs that are used to connect the form to the store are not typed.
  - ```typescript
    export default compose(
      connect(mapDispatchToProps),
      reduxForm({
        form: FORM.ADD_NOTICE_OF_DEPARTURE,
        onSubmitSuccess: resetForm(FORM.ADD_NOTICE_OF_DEPARTURE),
        initialValues: { nod_contacts: [{ is_primary: true }] },
        touchOnBlur: false,
        forceUnregisterOnUnmount: true,
        enableReinitialize: true,
      })
    )(AddNoticeOfDepartureForm) as React.FC<AddNoticeOfDepartureProps>;
    ```
    - See how the component is cast to the `React.FC<AddNoticeOfDepartureProps>` type.
    - Without this cast, the component will not be typed correctly and typescript will not recognize the import wherever it is being used

#### Redux-Form `<Field>` Component

The legacy implementation we have used of the `<Field>` component is not always compatible with typescript.

We have been assigning props to the field to be passed to the child component as follows:

```typescript
<Field
  someRandomProp={someRandomProp}
  name="vessel_name"
  component={RenderInput}
  label="Vessel Name"
  placeholder="Enter Vessel Name"
  validate={[required]}
/>
```

Typescript will not recognize the `someRandomProp` prop and will throw an error.
To convert, you can move any custom props to the `props` prop of the field as follows:

```typescript
<Field
  name="vessel_name"
  component={RenderInput}
  label="Vessel Name"
  placeholder="Enter Vessel Name"
  validate={[required]}
  props={{ someRandomProp }}
/>
```

The field will still pass the props to the child component, but typescript will not throw an error.

---
