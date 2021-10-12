interface InputProps {
    title: string
    id: string
    name: string
    numbRows: number
    value: string | number
    handleChange: (evt: 
        React.ChangeEvent<HTMLInputElement> 
        | React.ChangeEvent<HTMLSelectElement> 
        | React.ChangeEvent<HTMLTextAreaElement>) => void
    placeholder: string
}

const TextArea = (props: InputProps) => {
    return (
        <div className="mb-3">
            <label htmlFor={props.name} className="form-label">
                Description
            </label>
            <textarea
                className="form-control"
                id={props.name}
                name={props.name}
                rows={props.numbRows}
                value={props.value}
                onChange={props.handleChange}
                placeholder={props.placeholder}
            />
        </div>
    )
}

export default TextArea;