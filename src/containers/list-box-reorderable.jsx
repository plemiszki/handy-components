import React from 'react'
import OutlineButton from './outline-button';
import { sortArrayOfObjects } from './utils/sort';
import ChangeCase from 'change-case'

export default function ListBoxReorderable(props) {
  const {
    entityName,
    entityNamePlural: entityNamePluralArgument,
    entities,
    clickDelete,
    clickAdd,
    displayFunction,
    displayProperty,
    style
  } = props;
  const entityNamePlural = entityNamePluralArgument || `${entityName}s`

  const mouseDownHandle = (e) => {
    $('*').addClass('grabbing');
    let li = e.target.parentElement;
    li.classList.add('grabbed-element');
    let ul = e.target.parentElement.parentElement;
    ul.classList.add('grab-section');
  }

  const mouseUpHandle = (e) => {
    $('*').removeClass('grabbing');
    let li = e.target.parentElement;
    li.classList.remove('grabbed-element');
    let ul = e.target.parentElement.parentElement;
    ul.classList.remove('grab-section');
  }

  return (
    <>
      <div style={ style }>
        <ul>
          <li className="drop-zone" data-index="-1" data-section={ entityNamePlural }></li>
          { sortArrayOfObjects(entities, 'order').map((entity, index) => {
            return (
              <div key={ entity.id }>
                <li data-id={ entity.id } data-index={ index } data-section={ entityNamePlural }>
                  { displayProperty ? entity[displayProperty] : displayFunction(entity) }
                  <div
                    className="handle"
                    onMouseDown={ mouseDownHandle.bind(this) }
                    onMouseUp={ mouseUpHandle.bind(this) }
                  ></div>
                  <div
                    className="x-gray-circle"
                    onClick={ () => { clickDelete(entity.id) } }
                    data-id={ entity.id }
                  ></div>
                </li>
                <li className="drop-zone" data-index={ index } data-section={ entityNamePlural }></li>
              </div>
            );
          }) }
        </ul>
        <OutlineButton
          text={ `Add ${ChangeCase.titleCase(entityName)}` }
          onClick={ () => { clickAdd() } }
        />
      </div>
      <style jsx>{`
        ul {
          padding: 4px 11px;
          border: 1px solid #E4E9ED;
          border-radius: 5px;
          margin-bottom: 15px;
        }
        li.drop-zone {
          height: 7px;
        }
        li.drop-zone.highlight {
          border: dashed 1px black;
        }
        li:not(.drop-zone) {
          padding: 4px;
          position: relative;
        }
        .x-gray-circle {
          display: inline-block;
          position: absolute;
          right: 4px;
          background-size: contain;
          width: 17px;
          height: 17px;
          cursor: pointer;
        }
        .handle {
          display: inline-block;
          position: absolute;
          right: 30px;
          background-position: 50%;
          background-size: 17px;
          background-repeat: no-repeat;
          width: 17px;
          height: 17px;
          cursor: grab;
        }
      `}</style>
    </>
  );
}
