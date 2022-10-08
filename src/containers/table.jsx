import React from 'react'
import ChangeCase from 'change-case'

export default function Table({ styles, rows, columns }) {
	const mappedColumns = columns.map((column) => {
		if (typeof column === 'string') {
			return { name: column };
		} else {
			return column;
		}
	});
	return (
		<>
			<table style={ styles }>
				<thead>
					<tr>
						{ mappedColumns.map((column, columnIndex) => {
							return(
								<th key={ columnIndex }>
									{ column.header || ChangeCase.titleCase(column.name) }
								</th>
							);
						}) }
					</tr>
				</thead>
				<tbody>
					<tr><td></td></tr>
					{ rows.map((row, rowIndex) => {
						return(
							<tr key={ rowIndex }>
								{ mappedColumns.map((column, columnIndex) => {
									return(
										<td key={ columnIndex } className={ column.bold && 'bold' } >
											<a href={ `/films/${row.id}` }>
												{ row[column.name] }
											</a>
										</td>
									);
								}) }
							</tr>
						);
					}) }
				</tbody>
			</table>
		</>
	);
}
