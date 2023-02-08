import React, { useState } from 'react'
import ChangeCase from 'change-case'
import Index from './modules/index.js'
import { orderBy } from 'lodash'
import { commonSort } from './utils/sort.js'

const columnWidth = (column, defaultColumnWidth) => {
	const { width, isDeleteButton } = column;
	if (width) {
		return {
			width,
		}
	}
	if (isDeleteButton) {
		return {
			width: 27, // image width (17) + padding (10)
		}
	}
	if (defaultColumnWidth) {
		return {
			width: defaultColumnWidth,
		}
	}
}

export default function Table({
	alphabetize,
	clickDelete,
	clickEdit,
	clickRow,
	columns,
	defaultColumnWidth,
	defaultSearchColumn,
	hover = true,
	fixed = false,
	links = true,
	marginBottom,
	rows,
	searchText,
	sortable = true,
	style = {},
	test,
	urlPrefix,
	urlProperty,
}) {

	if (marginBottom) {
		Object.assign(style, { marginBottom: 30 });
	}

	let mappedColumns = columns.map((column) => {
		if (typeof column === 'string') {
			return { name: column };
		} else {
			return column;
		}
	});

	if (clickDelete && !mappedColumns.find(column => column.isDeleteButton)) {
		mappedColumns.push({
			isDeleteButton: true,
		});
	}

	const [searchColumn, setSearchColumn] = useState(defaultSearchColumn ? mappedColumns.find(column => column.name === defaultSearchColumn) : mappedColumns[0])
	if (mappedColumns.length === 1) {
		sortable = false;
	}

	const standardIndexSort = (entity) => {
    const searchProperty = searchColumn.sortColumn || searchColumn.name
    return commonSort(searchProperty, entity, searchColumn)
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
				<table style={ style } className={ !hover && 'no-hover' } data-test={ test }>
					<thead>
						<tr>
							{ mappedColumns.map((column, columnIndex) => {
								const { name, header, blankHeader } = column;
								const headerText = blankHeader ? '' : (header || ChangeCase.titleCase(name));
								if (sortable) {
									return (
										<th key={ columnIndex } style={ columnWidth(column, defaultColumnWidth) }>
											<div
												className={ Index.sortClass(name, searchColumn) }
												onClick={ () => { setSearchColumn(column) } }
											>
												{ headerText }
											</div>
										</th>
									);
								} else {
									return (
										<th key={ columnIndex } style={ columnWidth(column, defaultColumnWidth) }>
											{ headerText }
										</th>
									);
								}
							}) }
						</tr>
					</thead>
					<tbody>
						<tr><td></td></tr>
						{ ((sortable || alphabetize) ? orderedRows : filteredRows).map((row, rowIndex) => {
							return (
								<tr key={ rowIndex }>
									{ mappedColumns.map((column, columnIndex) => {
										const {
											bold,
											buttonText,
											clickButton,
											displayFunction,
											isButton,
											isDeleteButton,
											isEditButton,
											name,
											redIf,
										} = column;

										let classNames = [];
										if (bold) {
											classNames.push('bold')
										}
										if (redIf && redIf(row)) {
											classNames.push('red')
										}
										const className = classNames.join(' ')

										const displayValue = displayFunction ? displayFunction(row) : row[name];

										if (isDeleteButton) {
											return (
												<td key={ columnIndex } className="button">
													<div className="x-gray-circle" onClick={ () => clickDelete(row) }></div>
												</td>
											);
										}
										if (isEditButton) {
											return (
												<td key={ columnIndex } className="button">
													<div className="edit-image" onClick={ () => clickEdit(row) }></div>
												</td>
											);
										}
										if (isButton) {
											return (
												<td key={ columnIndex } className={ className }>
													<div
														className="link-padding custom-button"
														onClick={ () => clickButton(row) }
													>
														{ buttonText }
													</div>
												</td>
											);
										}
										if (!links) {
											return (
												<td key={ columnIndex } className={ className }>
													<div className="link-padding">
														{ displayValue }
													</div>
												</td>
											);
										}
										if (clickRow) {
											return (
												<td key={ columnIndex } className={ className }>
													<div className="link-padding pointer" onClick={ () => { clickRow(row) } }>
														{ displayValue }
													</div>
												</td>
											);
										}
										return (
											<td key={ columnIndex } className={ className }>
												<a href={ `/${urlPrefix}/${urlProperty ? row[urlProperty] : row.id}` }>
													{ displayValue }
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
				.horizontal-scroll {
					overflow-x: scroll;
				}
				table {
					width: 100%;
					user-select: none;
					font-size: 12px;
					line-height: 17px;
					table-layout: ${fixed ? 'fixed' : 'auto'}
				}
				thead {
					border-bottom: solid 1px #dadee2;
				}
				th {
					font-family: 'TeachableSans-SemiBold';
					color: black;
					padding-bottom: 20px;
				}
				th:first-of-type {
					padding-left: 10px;
				}
				th div {
					display: inline;
				}
				th div.sort-header-active {
					cursor: pointer;
          color: var(--highlight-color, #000);
          font-family: 'TeachableSans-ExtraBold';
				}
				th div.sort-header-inactive {
					cursor: pointer;
				}
				tr:first-child td {
					padding-top: 10px;
				}
				tr.bold td, td.bold {
					font-family: 'TeachableSans-Medium';
					color: black;
				}
				.red {
					color: red;
				}
				table:not(.no-hover) tr:not(:first-child):not(.no-hover):hover {
          background-color: #F5F5F5;
        }
				td {
					position: relative;
					color: #96939B;
					white-space: nowrap;
				}
				td:first-of-type {
					padding-left: 10px;
				}
				a, .link-padding {
					display: block;
					width: 100%;
					padding: 10px 0;
				}
				.link-padding.pointer {
					cursor: pointer;
				}
				.custom-button {
					cursor: pointer;
				}
				.custom-button:hover {
					text-decoration: underline;
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
