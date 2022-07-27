import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const useOutsideAlerter = (ref, setOpen, open) => {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */

    const handleClickOutside = (event) => {
      if (open) {
        if (ref.current && !ref.current.contains(event.target)) {
          setOpen(!open);
        }
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
};

const propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

const NotificationDrawer = (props) => {
  const { open, setOpen } = props;

  const modalRef = useRef(null);
  useOutsideAlerter(modalRef, setOpen, open);

  useEffect(() => {
    console.log("open", open);
  }, [open]);

  return (
    <div ref={modalRef} className={`notification-drawer ${open ? "notification-drawer-open" : ""}`}>
      Stuff
    </div>
  );
};

NotificationDrawer.propTypes = propTypes;

export default NotificationDrawer;
