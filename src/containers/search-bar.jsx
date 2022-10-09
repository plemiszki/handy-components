import React from 'react'

export default function SearchBar(props) {
	const { margin, onChange, value } = props;

	return (
		<>
			<input
				className="search-box"
				onChange={ onChange }
				value={ value }
			/>
			<style jsx>{`
				input.search-box {
					float: right;
					width: 250px;
					font-size: 12px;
					line-height: 17px;
					color: #5F5F5F;
					padding: 15px 15px 15px 50px;
					background-position: 15px 15px;
					border: solid 1px #E4E9ED;
					border-radius: 100px;
					margin-right: ${margin ? '30px' : '0' };
				}
			`}</style>
		</>
	);
}
