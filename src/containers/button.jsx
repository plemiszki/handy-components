import React from 'react'
import Common from './modules/common.jsx'

export default function Button(props) {
	const {
		text,
		styles,
		onClick,
		disabled = false,
		float = false,
		submit = false,
		marginRight = false,
		marginLeft = false,
		marginBottom = false,
	} = props;

	return (
		<>
			{ submit ? (
				<input
					type="submit"
					className={ `${Common.renderDisabledButtonClass(disabled)}` }
					value={ text }
					onClick={ (e) => {
						e.preventDefault()
						onClick()
					}}
				/>) : (
				<a
					style={ styles }
					className={ `${Common.renderDisabledButtonClass(disabled)}` }
					onClick={ () => onClick() }
				>{ text }</a>)
			}
			<style jsx>{`
				a, input {
					display: inline-block;
					font-family: 'TeachableSans-Medium';
					padding: 15px 40px;
					text-align: center;
					font-size: 12px;
					line-height: 17px;
					border-radius: 100px;
					background-color: var(--button-color);
					color: white;
					letter-spacing: inherit;
					border: none;
					cursor: pointer;
					float: ${float ? 'right' : 'none'};
					margin-right: ${marginRight ? '30px' : 0};
					margin-left: ${marginLeft ? '30px' : 0};
					margin-bottom: ${marginBottom ? '30px' : 0};
				}
				a:hover, input:hover {
					text-decoration: none;
					background-color: var(--highlight-color);
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
