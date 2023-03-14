import React, { useState } from 'react'
import ChangeCase from 'change-case'
import Index from './modules/index.js'
import { orderBy, result } from 'lodash'
import { commonSort } from './utils/sort.js'
import Common from './modules/common.jsx'

const columnWidth = (column, defaultColumnWidth) => {
	const { width, isDeleteButton, useArrows } = column;
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
	if (useArrows) {
		return {
			width: 90,
		}
	}
	if (defaultColumnWidth) {
		return {
			width: defaultColumnWidth,
		}
	}
}

const getStyle = (styleIf, entity) => {
	if (!styleIf) {
		return null;
	}
	let result = {}
	styleIf.forEach((obj) => {
		const { func, style } = obj;
		if (func(entity)) {
			result = Object.assign(result, style);
		}
	})
	return result;
}

const totalRow = (columns, rows) => {
	let result = {};
	columns.forEach(column => {
		if (column.totalRow) {
			result[column.name] = rows.reduce((total, row) => total = total + row[column.name], 0);
			result.isTotalRow = true;
		}
	});
	if (Object.keys(result).length) {
		return [result];
	}
	return [];
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
	sortable: tableSortable = true,
	style = {},
	styleIf,
	test,
	urlPrefix,
	urlProperty,
}) {

	if (marginBottom) {
		Object.assign(style, { marginBottom: 30 });
	}

	let mappedColumns = columns.reduce((result, column) => {
		if (typeof column === 'string') {
			result.push({ name: column });
		} else {
			const { include = true } = column;
			if (include) {
				result.push(column);
			}
		}
		return result;
	}, []);

	if (clickDelete && !mappedColumns.find(column => column.isDeleteButton)) {
		mappedColumns.push({
			isDeleteButton: true,
		});
	}

	const [searchColumn, setSearchColumn] = useState(defaultSearchColumn ? mappedColumns.find(column => column.name === defaultSearchColumn) : mappedColumns[0])
	if (mappedColumns.length === 1) {
		tableSortable = false;
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
								const { name, header, blankHeader, sortable: columnSortable = true, centered } = column;
								const headerText = blankHeader ? '' : (header || ChangeCase.titleCase(name));
								const className = centered ? 'text-center' : '';
								if (tableSortable && columnSortable) {
									return (
										<th key={ columnIndex } style={ columnWidth(column, defaultColumnWidth) } className={ className }>
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
										<th key={ columnIndex } style={ columnWidth(column, defaultColumnWidth) } className={ className }>
											{ headerText }
										</th>
									);
								}
							}) }
						</tr>
					</thead>
					<tbody>
						<tr><td></td></tr>
						{ ((tableSortable || alphabetize) ? orderedRows : filteredRows).concat(totalRow(mappedColumns, rows)).map((row, rowIndex) => {
							const { isTotalRow } = row;
							return (
								<tr key={ rowIndex } className={ isTotalRow && 'total-row no-hover' } style={ getStyle(styleIf, row) }>
									{ mappedColumns.map((column, columnIndex) => {
										const {
											bold,
											boldIf,
											buttonText,
											clickButton,
											clickSwitch,
											displayFunction,
											isButton,
											isDeleteButton,
											isEditButton,
											isSwitch,
											name,
											redIf,
											displayIf,
											useArrows,
											arrowsIf,
											clickLeft,
											clickRight,
											centered,
										} = column;

										if (displayIf && !displayIf(row)) {
											return (
												<td key={ columnIndex }></td>
											);
										}

										let classNames = [];
										if (isTotalRow || bold || (boldIf && boldIf(row))) {
											classNames.push('bold');
										}
										if (redIf && redIf(row)) {
											classNames.push('red');
										}
										if (centered) {
											classNames.push('text-center');
										}
										const className = classNames.join(' ');

										const displayValue = displayFunction ? displayFunction(row) : row[name];

										if (isTotalRow && (isDeleteButton || isEditButton || isButton || isSwitch)) {
											return (
												<td key={ columnIndex }></td>
											);
										}
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
										if (isSwitch) {
											return (
												<td key={ columnIndex } className={ className }>
													{ Common.renderSwitchComponent({
														onChange: (e) => {
															clickSwitch(row, e.target.checked);
														},
														checked: row.useAllAvailable,
														width: 50,
														height: 24,
														circleSize: 16,
													}) }
												</td>
											);
										}
										if (useArrows || (arrowsIf && arrowsIf(row))) {
											return (
												<td key={ columnIndex } className={ className }>
													<div className="link-padding" data-test={`${rowIndex}-${columnIndex}`}>
														<div
															className="arrow left-arrow"
															onClick={ () => { clickLeft(row) } }
														></div>
														<p className="arrows-cell-value">{ displayValue }</p>
														<div
															className="arrow right-arrow"
															onClick={ () => { clickRight(row) } }
														></div>
													</div>
												</td>
											);
										}
										if (!links) {
											return (
												<td key={ columnIndex } className={ className }>
													<div className="link-padding" data-test={`${rowIndex}-${columnIndex}`}>
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
					color: #96939B;
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
					font-family: 'TeachableSans-SemiBold';
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
				.arrow {
					display: inline-block;
					width: 20px;
					height: 17px;
					background-size: 30%;
					background-position: center;
					vertical-align: middle;
					cursor: pointer;
				}
				.arrows-cell-value {
					display: inline-block;
					width: 50px;
					text-align: center;
					vertical-align: middle;
				}
				.total-row .left-arrow, .total-row .right-arrow {
					background-image: none;
				}
			`}</style>
		</>
	);
}
