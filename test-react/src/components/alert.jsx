import React, { useState } from 'react';
import './components.css';

export default function Alert({ children, type, message, close }) {

    const [isDisplayed, setIsDisplayed] = useState(true);
    const renderElAlert = function () {
        return React.cloneElement(children);
    };
    const handleClose = (e) => {
        e.preventDefault();
        setIsDisplayed(false);
        close();
    };
    return (
        <div className={`alert ${type} ${!isDisplayed && "hide"}`} onClick={handleClose}>
            <span className={'closebtn'}>
                &times;
            </span>
            {children ? renderElAlert() : message}
        </div>
    );
}