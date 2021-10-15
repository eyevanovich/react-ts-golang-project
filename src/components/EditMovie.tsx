import React, { FC, useState, useEffect, Fragment } from 'react'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom';
import { AlertProps, TokenProps, Movie, EditState } from './Interfaces'
import './EditMovie.css';
import Input from './form-components/Input';
import TextArea from './form-components/TextArea';
import Select from './form-components/Select';
import { MPAAOptions } from './Interfaces';
import Alert from "./ui-components/Alert";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const EditMovie: FC<RouteComponentProps<EditState> & TokenProps> = (props) => {

    let initMovie: Movie = {
        title: "",
        mpaa_rating: "",
        description: "",
        genres: "",
        id: 0,
        rating: 0,
        release_date: "",
        runtime: 0,
        year: 0
    };

    const mpaaOptions: MPAAOptions[] = [
        { id: "G", value: "G" },
        { id: "PG", value: "PG" },
        { id: "PG-13", value: "PG-13" },
        { id: "R", value: "R" },
        { id: "NC-17", value: "NC-17" },
    ];

    let initAlert: AlertProps = {
        alertType: "d-none",
        alertMessage: ""
    };

    // state for movie
    const [movie, setMovie] = useState<Movie>(initMovie);
    // state for if data is loaded or not (default false)
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [error, setError] = useState<Error>();
    const [errors, setErrors] = useState<string[]>([]);
    const [alert, setAlert] = useState<AlertProps>(initAlert);

    const handleSubmit = (evt: React.ChangeEvent<HTMLFormElement>): void => {
        evt.preventDefault();

        let errors = [];
        if (movie.title === "") {
            errors.push("title");
        }
        if (movie.runtime <= 0) {
            errors.push("runtime");
        }

        setErrors(errors);

        if (errors.length > 0) {
            return
        }

        const data = new FormData(evt.target)
        const payload = Object.fromEntries(data.entries());
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer " + props.token.jwt);

        const requestOptions = {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: headers
        };

        fetch('http://localhost:4000/v1/admin/editmovie', requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    setAlert(
                        {
                            alertType: "alert-danger",
                            alertMessage: data.error.message
                        });
                } else {
                    props.history.push({
                        pathname: "/admin",
                    })

                }
            });
    };

    const hasError = (key: string) => {
        return errors.indexOf(key) !== -1;
    };

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>
        | React.ChangeEvent<HTMLTextAreaElement>): void => {
        let value: string = evt.target.value;
        let name: string = evt.target.name;
        setMovie((prevState: Movie) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const componentDidMount = () => {
        if (props.token.jwt === "") {
            props.history.push({
                pathname: "/login",
            });
            return;
        }
        // API fetch call to go backend
        const id = props.match.params.id;
        if (Number(id) > 0) {
            fetch("http://localhost:4000/v1/movie/" + id)
                .then((response) => {
                    console.log("status code is", response.status)
                    if (response.status !== 200) {
                        let err = new Error();
                        err.message = "Invalid response code: " + response.status;
                        setError(err);
                    }
                    return response.json();
                })
                .then((json) => {
                    const releaseDate = new Date(json.movie.release_date);

                    let theMovie: Movie = {
                        title: json.movie.title,
                        mpaa_rating: json.movie.mpaa_rating,
                        description: json.movie.description,
                        genres: json.movie.genres,
                        id: Number(id),
                        rating: json.movie.rating,
                        release_date: releaseDate.toISOString().split("T")[0],
                        runtime: json.movie.runtime,
                        year: json.movie.year
                    };

                    setMovie(theMovie);
                    setIsLoaded(true);
                },
                    (error) => {
                        setIsLoaded(true);
                        setError(error);
                    });
        } else {
            setIsLoaded(true)
        }
    };

    useEffect(componentDidMount, [props.match.params.id, props.token, props.history]);

    const confirmDelete = () => {
        confirmAlert({
            title: 'Delete Movie?',
            message: 'Are you sure?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        const headers = new Headers();
                        headers.append("Content-Type", "application/json");
                        headers.append("Authorization", "Bearer " + props.token.jwt);

                        fetch("http://localhost:4000/v1/admin/deletemovie/" + movie.id,
                            {
                                method: "GET",
                                headers: headers
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.error) {
                                    setAlert(
                                        {
                                            alertType: "alert-danger",
                                            alertMessage: data.error.message
                                        });
                                } else {
                                    props.history.push({
                                        pathname: "/admin",
                                    })
                                }
                            })
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    };

    if (error) {
        return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
        return <p>Loading...</p>;
    } else {
        return (
            <Fragment>
                <h2>Add/Edit Movie</h2>
                <Alert
                    alertType={alert.alertType}
                    alertMessage={alert.alertMessage}
                />
                <hr />
                <form onSubmit={handleSubmit}>
                    <input
                        type="hidden"
                        name="id"
                        id="id"
                        value={movie.id}
                        onChange={handleChange}
                    />

                    {/* Reused Component from ./form-components/Input */}
                    <Input
                        title={'Title'}
                        type={'text'}
                        name={'title'}
                        id={'title'}
                        placeholder="Title of the movie"
                        value={movie.title}
                        handleChange={handleChange}
                        errorDiv={hasError("title") ? "text-danger" : "d-none"}
                        errorMsg={"Please enter a title"}
                        className={hasError("title") ? "is-invalid" : ""}
                    />

                    {/* Reused Component from ./form-components/Input */}
                    <Input
                        title={'Release Date'}
                        type={'date'}
                        name={'release_date'}
                        id={'release_date'}
                        placeholder={""}
                        value={movie.release_date}
                        handleChange={handleChange}
                        className={""}
                        errorDiv={""}
                        errorMsg={""}
                    />

                    {/* Reused Component from ./form-components/Input */}
                    <Input
                        title={'Runtime'}
                        type={'number'}
                        name={'runtime'}
                        id={'runtime'}
                        placeholder={""}
                        value={movie.runtime}
                        handleChange={handleChange}
                        errorDiv={hasError("runtime") ? "text-danger" : "d-none"}
                        errorMsg={"Please enter a runtime of longer than 0"}
                        className={hasError("runtime") ? "is-invalid" : ""}
                    />

                    {/* Reused Component from ./form-components/Select */}
                    <Select
                        title={"MPAA Rating"}
                        name={"mpaa_rating"}
                        id={"mpaa_rating"}
                        options={mpaaOptions}
                        value={movie.mpaa_rating}
                        handleChange={handleChange}
                        placeholder={"Choose..."}
                    />

                    {/* Reused Component from ./form-components/Input */}
                    <Input
                        title={'Rating'}
                        type={'number'}
                        name={'rating'}
                        id={'rating'}
                        placeholder=""
                        value={movie.rating}
                        handleChange={handleChange}
                        className={""}
                        errorDiv={""}
                        errorMsg={""}
                    />

                    {/* Reused Component from ./form-components/TextArea */}
                    <TextArea
                        title={'Description'}
                        name={'description'}
                        id={'description'}
                        placeholder="Description of the movie"
                        value={movie.description}
                        handleChange={handleChange}
                        numbRows={3}
                    />

                    <hr />
                    <button className="btn btn-primary">Save</button>
                    <Link to="/admin" className="btn btn-warning ms-1">Cancel</Link>
                    {movie.id > 0 && (
                        <a href="#!" onClick={() => confirmDelete()} // must use () => syntax or this will fire automatically
                            className="btn btn-danger ms-1">
                            Delete
                        </a>
                    )}
                </form>
            </Fragment>
        )
    }
}

export default EditMovie;