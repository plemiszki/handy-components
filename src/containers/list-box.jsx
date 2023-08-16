import React from 'react'
import OutlineButton from './outline-button';
import { hyphenCase } from 'change-case'
import { titleCase } from './utils/convert';

export default function ListBox(props) {
	const { entities, entityNamePlural: passedEntityNamePlural, clickDelete, style, displayFunction, displayProperty, clickAdd, entityName, buttonText, sort, styleIf } = props
  const entityNamePlural = passedEntityNamePlural || `${entityName}s`

  const getValue = (entity) => {
    return displayProperty ? entity[displayProperty] : displayFunction(entity)
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

	return (
    <>
      <div style={ style }>
        <ul data-test={ hyphenCase(entityNamePlural) }>
          { (sort ? entities.sort((a, b) => getValue(a).localeCompare(getValue(b))) : entities).map((entity, index) => {
            return (
              <li key={ index } style={ getStyle(styleIf, entity) }>
                { getValue(entity) }
                { clickDelete && (
                  <div className="x-gray-circle" onClick={ () => { clickDelete(entity) } }></div>
                ) }
              </li>
            );
          }) }
        </ul>
        { clickAdd && (
          <OutlineButton
            text={ buttonText || `Add ${titleCase(entityName)}` }
            onClick={ () => { clickAdd() } }
          />
        ) }
      </div>
      <style jsx>{`
        ul {
          border: 1px solid #E4E9ED;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: ${clickAdd ? 15 : 30}px;
        }
        li {
          position: relative;
        }
        li:not(:last-of-type) {
          margin-bottom: 15px;
        }
        .x-gray-circle {
          display: inline-block;
          position: absolute;
          right: 0;
          background-size: contain;
          width: 17px;
          height: 17px;
          cursor: pointer;
        }
      `}</style>
    </>
	);
}
