import { AlertProps } from "../Interfaces";

const Alert = (props: AlertProps) => {
    return (
        <div className={`alert ${props.alertType}`} role="alert">
            {props.alertMessage}
        </div>
    )
}

export default Alert;