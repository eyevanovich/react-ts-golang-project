import React, { FC, useState, useEffect, Fragment } from "react";
import Input from "./form-components/Input";
import { Movie, AlertProps } from "./Interfaces";
import { Link } from 'react-router-dom';

const GraphQL: FC = (props) => {
    let initAlert: AlertProps = {
        alertType: "d-none",
        alertMessage: "",
    };

    const [movies, setMovies] = useState<Movie[]>([]);
    // state for if data is loaded or not (default false)
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [error, setError] = useState<Error>();
    const [errors, setErrors] = useState<string[]>([]);
    const [alert, setAlert] = useState<AlertProps>(initAlert);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const componentDidMount = () => {
        const payload = `
        { 
            list {
                id
                title
                runtime
                year
                description
            }
        }`

        const myHeaders: Headers = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "POST",
            body: payload,
            headers: myHeaders,
        }

        fetch(`${process.env.REACT_APP_API_URL}/v1/graphql`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                let theList: Movie[] = Object.values(data.data.list);
                return theList;
            })
            .then((theList) => {
                setMovies(theList);
            });
    };

    useEffect(componentDidMount, []);

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>
        | React.ChangeEvent<HTMLTextAreaElement>) => {
        let value = evt.target.value;
        setSearchTerm(value);
        if (value.length > 2){
            performSearch();
        }
        else{
            setMovies([])
        }
    }

    function performSearch() {
        const payload = `
        { 
            search(titleContains: "${searchTerm}") {
                id
                title
                runtime
                year
                description
            }
        }`

        const myHeaders: Headers = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "POST",
            body: payload,
            headers: myHeaders,
        }

        fetch(`${process.env.REACT_APP_API_URL}/v1/graphql`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                let theList: Movie[] = Object.values(data.data.search);
                return theList;
            })
            .then((theList) => {
                if(theList.length > 0){
                    setMovies(theList);
                } else {
                    theList = [];
                    setMovies(theList);
                }
            });
    }

    return (
        <Fragment>
            <h2>GraphQL</h2>
            <hr />

            <Input
                title={"Search"}
                type={"text"}
                id={"search"}
                name={"search"}
                value={searchTerm}
                handleChange={handleChange}
                className=""
                errorDiv=""
                errorMsg=""
                placeholder=""
            />
            <div className="list-group">
                {movies.map((m) => (
                    <Link
                        key={m.id}
                        className="list-group-item list-group-item-action"
                        to={`/movies-graphql/${m.id}`}
                    >
                        <strong>{m.title}</strong><br />
                        <small className='text-muted'>
                            ({m.year}) - {m.runtime} minutes
                        </small>
                        <br />
                        {m.description.slice(0, 100)}...
                    </Link>
                ))}
            </div>
        </Fragment> 
    );
};

export default GraphQL;
