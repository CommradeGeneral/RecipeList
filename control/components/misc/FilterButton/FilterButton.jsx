import './FilterButton.css'


export function FilterButton({ onClick, props }) {

    return (
        <button onClick={onClick}
                className="filter-button"
                type="button"
                {...props }
        >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 4 21 4 14 12.5 14 20 10 17.5 10 12.5" />
            </svg>
        </button >
    )
}
