import React from 'react'

export default function GrayedOut(props) {
  const { visible, borderRadius } = props;
  const grayedOutStyle = {
    position: 'absolute',
    backgroundColor: 'gray',
    opacity: 0.1,
    width: '100%',
    height: '100%',
    borderRadius: borderRadius || 5,
    top: 0,
    left: 0
  };
  if (visible) {
    return (
      <div className="grayed-out" style={ grayedOutStyle }>
      </div>
    );
  } else {
    return null;
  }
}
