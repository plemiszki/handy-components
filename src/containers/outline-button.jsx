import React from 'react'
import Common from './modules/common.jsx'

export default function OutlineButton(props) {
	const {
		text,
		styles,
		onClick,
		disabled = false,
		marginRight = false,
		marginLeft = false,
    marginBottom = false,
		float = false,
	} = props;

	return (
		<>
      <a
        style={ styles }
        className={ `${Common.renderDisabledButtonClass(disabled)}` }
        onClick={ onClick }
			>{ text }</a>
			<style jsx>{`
				a {
          padding: 5px 10px 5px 10px;
          min-width: 120px;
					display: inline-block;
					font-family: 'TeachableSans-Regular';
          color: #01647C;
          border: solid 1px #01647C;
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
					color: #01647C;
					user-select: none;
				}
				a.disabled {
					pointer-events: none;
				}
			`}</style>
		</>
	);
}
