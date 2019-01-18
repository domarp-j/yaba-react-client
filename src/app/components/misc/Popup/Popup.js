import React from 'react';
import PropTypes from 'prop-types';
import { Popup as SemPopup } from 'semantic-ui-react';

const Popup = ({ style, ...props }) => {
  let popupStyle = { boxShadow: 'none', zIndex: 0 };

  if (style) {
    popupStyle = { ...popupStyle, ...style };
  }

  return (
    <SemPopup
      keepInViewPort
      on='click'
      style={popupStyle}
      {...props}
    />
  );
};

Popup.propTypes = {
  style: PropTypes.object,
};

export default Popup;
