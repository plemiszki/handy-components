import React from 'react'
import Common from './modules/common.jsx'

export default function Button(props) {
	const {
		className,
		color,
		disabled = false,
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

	const classNamesString = [className, Common.renderDisabledButtonClass(disabled)].filter(e => e).join(' ');

	return (
		<>
			{ submit ? (
				<input
					type="submit"
					style={ style }
					className={ classNamesString }
					value={ text }
					onClick={ (e) => {
						e.preventDefault()
						onClick()
					}}
				/>) : (
				<a
					style={ style }
					className={ classNamesString }
					onClick={ () => onClick() }
				>{ text }</a>)
			}
			<style jsx>{`
				a, input {
					display: inline-block;
					font-family: 'TeachableSans-${square ? 'Bold' : 'Medium'}';
					padding: ${square ? '12px 20px' : '15px 40px'};
					text-align: center;
					font-size: 12px;
					line-height: 17px;
					border-radius: ${square ? '5px' : '100px'};
					background-color: ${color ? `${color} !important` : 'var(--button-color)'};
					color: white;
					letter-spacing: inherit;
					border: none;
					cursor: pointer;
					float: ${float ? 'right' : 'none'};
					margin-right: ${marginRight ? '30px' : 0};
					margin-left: ${marginLeft ? '30px' : 0};
					margin-bottom: ${marginBottom ? '30px' : 0};
					user-select: none;
				}
				a:hover, input:hover {
					text-decoration: none;
					background-color: ${hoverColor ? `${hoverColor} !important` : 'var(--highlight-color)'};
					color: white;
				}
				a.disabled, input.disabled {
					pointer-events: none;
					opacity: 0.65;
				}
			`}</style>
		</>
	);
}
