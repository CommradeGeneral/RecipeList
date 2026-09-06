import './Navigation.css'

export function Navigation({
    currentPage,
    totalPages,
    onPrevious,
    onNext,
    onPageChange,
}) {
    return <div className="navigation">
        <button
            className="navigation-button"
            type="button"
            aria-label="Previous recipe page"
            onClick={onPrevious}
            disabled={currentPage === 1}
        >
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="m9.5 3.5-4 4.5 4 4.5" />
            </svg>
        </button>
        <select
            className="navigation-dropdown"
            aria-label="Select recipe page"
            value={currentPage}
            onChange={(event) => onPageChange(Number(event.target.value))}
        >
            {Array.from({ length: totalPages }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                    {index + 1} / {totalPages}
                </option>
            ))}
        </select>
        <button
            className="navigation-button"
            type="button"
            aria-label="Next recipe page"
            onClick={onNext}
            disabled={currentPage === totalPages}
        >
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="m6.5 3.5 4 4.5-4 4.5" />
            </svg>
        </button>
    </div>
}
