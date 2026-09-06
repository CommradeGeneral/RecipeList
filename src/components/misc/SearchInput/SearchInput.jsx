import './SearchInput.css'


export function SearchInput({ placeholder = 'Search recipe...', value, onChange, props }) {

    return (
        <div className="search-input" {...props }>
            <input type="text"
                   placeholder={placeholder}
                   value={value}
                   onChange={onChange}
            />
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
        </div>
    )
}
