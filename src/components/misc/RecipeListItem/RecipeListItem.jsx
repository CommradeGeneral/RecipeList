import './RecipeListItem.css'


export function RecipeListItem({
    code = 'A',
    name = '',
    id = '1',
    createdBy = 'El-king dot com',
    status = true,
    onClick = (e)=> {}
}) {
    return <div className="recipe-item" onClick={(e)=> {
        onClick(e);
    }}>
        <div className="recipe-name" style={{ fontWeight: 'bold', fontSize: '1.3em' }}>
            <div> {code} - {name} </div>
        </div>
        <div className="recipe-id" style={{ fontWeight: 'bold' }}>
            {id}
        </div>
        <div className="recipe-createdby"
            style={{
                display: 'flex',
                justifyContent: 'space-between'
            }}>
            <div>
                Created by: {createdBy}
            </div>
            <div className="status" style={{
                fontWeight: 'bold',
                padding: '3px 6px',
                borderRadius: '5px',
                backgroundColor: status ? '#b9fba4' : '#ffbcc2',
                color: status ? 'green' : 'red'
            }}>
                {status ? 'Active' : 'Inactive'}
            </div>
        </div>
    </div>;
}