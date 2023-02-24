import React from 'react'
import Common from './modules/common.jsx'

export default function OutlineButton(props) {
	const {
		text,
		style,
		onClick,
		disabled = false,
		marginRight = false,
		marginLeft = false,
    marginBottom = false,
		float = false,
		color: passedColor,
	} = props;

	const color = passedColor || 'var(--button-color)';

	return (
		<>
      <a
        style={ style }
        className={ `${Common.renderDisabledButtonClass(disabled)}` }
        onClick={ onClick }
			>{ text }</a>
			<style jsx>{`
				a {
          padding: 7px 20px;
					line-height: 17px;
          min-width: 120px;
					display: inline-block;
					font-family: 'TeachableSans-Regular';
          color: ${color};
          border: solid 1px ${color};
					text-align: center;
					font-size: 12px;
					border-radius: 100px;
					background-color: white;
					letter-spacing: inherit;
					cursor: pointer;
					float: ${float ? 'right' : 'none'};
					margin-right: ${marginRight ? '30px' : 0};
					margin-left: ${marginLeft ? '30px' : 0};
          margin-bottom: ${marginBottom ? '30px' : 0};
				}
				a:hover {
					color: ${color};
					user-select: none;
				}
				a.disabled {
					pointer-events: none;
				}
			`}</style>
		</>
	);
}
