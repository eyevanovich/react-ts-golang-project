import React, { FC, useState, Fragment } from 'react'
import Input from './form-components/Input';
import { AlertProps, Email, Password, LoginProps } from './Interfaces';
import Alert from './ui-components/Alert';

const Login: FC<LoginProps> = (props) => {

    let initAlert: AlertProps = {
        alertType: "d-none",
        alertMessage: ""
    };

    // STATE
    const [email, setEmail] = useState<Email>({ email: "" });
    const [password, setPassword] = useState<Password>({ password: "" });
    // const [error, setError] = useState<Error>();
    const [errors, setErrors] = useState<string[]>([]);
    const [alert, setAlert] = useState<AlertProps>(initAlert);

    const handleJwtChange = (jwt: string) => {
        props.handleJwtChange(jwt)
    };

    const handleSubmit = (evt: React.ChangeEvent<HTMLFormElement>): boolean => {
        evt.preventDefault();

        let errors = [];
        if (email.email === "") {
            errors.push("email");
        }
        if (password.password === "") {
            errors.push("password");
        }

        setErrors(errors);

        if (errors.length > 0) {
            return false;
        }


        const data = new FormData(evt.target)
        const payload = Object.fromEntries(data.entries());

        const requestOptions = {
            method: 'POST',
            body: JSON.stringify(payload)
        }

        fetch(`${process.env.REACT_APP_API_URL}/v1/signin`, requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    setAlert(
                        {
                            alertType: "alert-danger",
                            alertMessage: data.error.message
                        });
                } else {
                    handleJwtChange(data.response);
                    let date = new Date();
                    let expDays = 1;
                    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
                    const expires = "expires=" + date.toUTCString();
       
                    // set the cookie
                    document.cookie =  "jwt="
                        + JSON.stringify(data.response)
                        + "; "
                        + expires
                        + "; path=/; SameSite=Strict; Secure;";
                    props.history.push({
                        pathname: "/admin",
                    })
                }
            })

        return true;
    };

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>
        | React.ChangeEvent<HTMLTextAreaElement>): void => {
        let value: string = evt.target.value;
        let name: string = evt.target.name;
        setEmail((prevState: Email) => ({
            ...prevState,
            [name]: value,
        }))
        setPassword((prevState: Password) => ({
            ...prevState,
            [name]: value,
        }))
    }

    const hasError = (key: string) => {
        return errors.indexOf(key) !== -1;
    }

    return (
        <Fragment>
            <h2>Login</h2>
            <hr />
            <Alert
                alertType={alert.alertType}
                alertMessage={alert.alertMessage}
            />
            <form className="pt-3" onSubmit={handleSubmit}>
                <Input
                    id={"email"}
                    title={"Email"}
                    type={"email"}
                    name={"email"}
                    handleChange={handleChange}
                    className={hasError("email") ? "is-invalid" : ""}
                    errorDiv={hasError("email") ? "text-danger" : "d-none"}
                    errorMsg={"Please enter a valid email address"}
                    value={email.email}
                    placeholder={"Email"}
                />
                <Input
                    id={"password"}
                    title={"Password"}
                    type={"password"}
                    name={"password"}
                    handleChange={handleChange}
                    className={hasError("password") ? "is-invalid" : ""}
                    errorDiv={hasError("password") ? "text-danger" : "d-none"}
                    errorMsg={"Please enter a valid password"}
                    value={password.password}
                    placeholder={"Password"}
                />
                <hr />
                <button className="btn btn-primary">Login</button>
            </form>
        </Fragment>
    )
}
export default Login;