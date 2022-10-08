import React from 'react'
import Common from './modules/common.jsx'

export default function Button(props) {
    const { text, styles, onClick, disabled = false } = props;

    return(
        <>
            <a style={ styles } className={ `${Common.renderDisabledButtonClass(disabled)}` } onClick={ () => onClick() }>{ text }</a>
            <style jsx>{`
                a {
                    display: inline-block;
                    font-family: 'TeachableSans-Medium';
                    padding: 15px 40px;
                    text-align: center;
                    font-size: 12px;
                    border-radius: 100px;
                    background-color: var(--button-color);
                    color: white;
                    letter-spacing: inherit;
                    border: none;
                    cursor: pointer;
                }
                a:hover {
                    text-decoration: none;
                    background-color: var(--highlight-color);
                    color: white;
                }
                a.disabled {
                    pointer-events: none;
                    opacity: 0.65;
                }
            `}</style>
        </>
    );
}
