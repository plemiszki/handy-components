import React, { useState } from 'react'
import ChangeCase from 'change-case'
import Index from './modules/index.js'
import { orderBy } from 'lodash'
import { commonSort } from './utils/sort.js'

const columnWidth = (column) => {
	if (column.width) {
		return {
			width: +column.width,
		}
	}
}

export default function Table({ styles = {}, rows, columns, searchText, urlPrefix, urlProperty, sortable = true, clickDelete, clickEdit, marginBottom }) {

	if (marginBottom) {
		Object.assign(styles, { marginBottom: 30 });
	}

	let mappedColumns = columns.map((column) => {
		if (typeof column === 'string') {
			return { name: column };
		} else {
			return column;
		}
	});

	const [searchColumn, setSearchColumn] = useState(mappedColumns[0])
	if (mappedColumns.length === 1) {
		sortable = false;
	}

	const standardIndexSort = (entity) => {
    const searchProperty = searchColumn.sortColumn || searchColumn.name
    return commonSort(searchProperty, entity)
  }

	const filteredRows = Index.filterSearchText({
    entities: rows,
    text: searchText,
    property: searchColumn.name
  })

	const orderedRows = orderBy(
		filteredRows,
		[standardIndexSort.bind(this)],
		(searchColumn.sortDir || 'asc'),
	)

	return (
		<>
			<div className="horizontal-scroll">
				<table style={ styles }>
					<thead>
						<tr>
							{ mappedColumns.map((column, columnIndex) => {
								if (sortable) {
									return (
										<th key={ columnIndex } style={ columnWidth(column) }>
											<div
												className={ Index.sortClass(column.name, searchColumn) }
												onClick={ () => { setSearchColumn(column) } }
											>
												{ column.header || ChangeCase.titleCase(column.name) }
											</div>
										</th>
									);
								} else {
									return (
										<th key={ columnIndex } style={ columnWidth(column) }>
											{ column.header || ChangeCase.titleCase(column.name) }
										</th>
									);
								}
							}) }
						</tr>
					</thead>
					<tbody>
						<tr><td></td></tr>
						{ orderedRows.map((row, rowIndex) => {
							return (
								<tr key={ rowIndex }>
									{ mappedColumns.map((column, columnIndex) => {
										if (column.isDeleteButton) {
											return (
												<td key={ columnIndex } className="button">
													<div className="x-gray-circle" onClick={ () => clickDelete(row) }></div>
												</td>
											);
										}
										if (column.isEditButton) {
											return (
												<td key={ columnIndex } className="button">
													<div className="edit-image" onClick={ () => clickEdit(row) }></div>
												</td>
											);
										}
										return (
											<td key={ columnIndex } className={ column.bold && 'bold' }>
												<a href={ `/${urlPrefix}/${urlProperty ? row[urlProperty] : row.id}` }>
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
			</div>
			<style jsx>{`
				table {
					line-height: 17px;
				}
				td.button {
					padding-top: 10px;
					line-height: 17px;
					vertical-align: top;
				}
				.x-gray-circle, .edit-image {
					display: inline-block;
					width: 17px;
					height: 17px;
					cursor: pointer;
					background-size: contain;
				}
			`}</style>
		</>
	);
}
