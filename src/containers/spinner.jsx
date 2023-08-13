import React from 'react'

export default function Spinner(props) {
  const { spinnerSize = 90, styles = {}, visible } = props;
  const spinnerStyle = Object.assign({
    width: spinnerSize,
    height: spinnerSize,
    left: 'calc(50% - ' + (spinnerSize / 2) + 'px)',
    top: 'calc(50% - ' + (spinnerSize / 2) + 'px)'
  }, styles);
  if (visible) {
    return (
      <>
        <div className="spinner handy-component-spinner" style={ spinnerStyle }></div>
        <style jsx>{`
          position: absolute;
          background-position: center;
          opacity: 0.75;
        `}</style>
      </>
    );
  } else {
    return null;
  }
}
