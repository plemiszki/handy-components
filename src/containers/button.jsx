import React from "react";
import Common from "./modules/common.jsx";
import { Tooltip } from "react-tooltip";

export default function Button(props) {
  const {
    className,
    color,
    disabled = false,
    disabledTooltip,
    float = false,
    hoverColor,
    marginBottom = false,
    marginLeft = false,
    marginRight = false,
    onClick,
    square = false,
    style,
    submit = false,
    text,
  } = props;

  const classNamesString = [
    className,
    Common.renderDisabledButtonClass(disabled),
  ]
    .filter((e) => e)
    .join(" ");

  return (
    <>
      {disabled && disabledTooltip ? <Tooltip id="tooltip" /> : null}
      <div
        data-tooltip-id="tooltip"
        data-tooltip-content={disabledTooltip}
        data-tooltip-placement="top"
      >
        {submit ? (
          <input
            type="submit"
            style={style}
            className={classNamesString}
            value={text}
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
          />
        ) : (
          <a
            tooltip-id="button"
            style={style}
            className={classNamesString}
            onClick={() => onClick()}
          >
            {text}
          </a>
        )}
      </div>
      <style jsx>{`
        div {
          display: inline-block;
          float: ${float ? "right" : "none"};
          margin-right: ${marginRight ? "30px" : 0};
          margin-left: ${marginLeft ? "30px" : 0};
        }
        a,
        input {
          display: inline-block;
          font-family: "TeachableSans-${square ? "Bold" : "Medium"}";
          padding: ${square ? "12px 20px" : "15px 40px"};
          text-align: center;
          font-size: 12px;
          line-height: 17px;
          border-radius: ${square ? "5px" : "100px"};
          background-color: ${color
            ? `${color} !important`
            : "var(--button-color)"};
          color: white;
          letter-spacing: inherit;
          border: none;
          cursor: pointer;
          margin-bottom: ${marginBottom ? "30px" : 0};
          user-select: none;
        }
        a:hover,
        input:hover {
          text-decoration: none;
          background-color: ${hoverColor
            ? `${hoverColor} !important`
            : "var(--highlight-color)"};
          color: white;
        }
        a.disabled,
        input.disabled {
          pointer-events: none;
          opacity: 0.65;
        }
      `}</style>
    </>
  );
}
