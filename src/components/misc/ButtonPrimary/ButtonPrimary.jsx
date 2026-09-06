import './ButtonPrimary.css'
import { useState } from 'react'


export function ButtonPrimary({ children, props, onClick }) {

    return (
        <button onClick={onClick} 
                className="button-primary" 
                {...props }
        >
            { children }    
        </button >
    )
}