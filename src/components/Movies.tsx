import React, { FC, Fragment, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Movie } from "./Interfaces";

const Movies: FC = (props) => {
    // state for movies
    const [movies, setMovies] = useState<Movie[]>([])
    // state for if data is loaded or not (default false)
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [error, setError] = useState<Error>()

    const componentDidMount = () => {
        // API fetch call to go backend
        fetch(`${process.env.REACT_APP_API_URL}/v1/movies`)
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
                setMovies(json.movies);
                setIsLoaded(true);
            },
            (error) => {
                setIsLoaded(true);
                setError(error);
            });
    };
    useEffect(() => {
        componentDidMount()
    }, []);

    if (error) {
        return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
        return <p>Loading...</p>;
    } else {
        return (
            <Fragment>

                <h2>Choose a movie...</h2>

                <div className="list-group">
                    {movies.map(movie => (
                        <Link key={movie.id} to={`/movies/${movie.id}`} className="list-group-item list-group-item-action">{movie.title}</Link>
                    ))}
                </div>
            </Fragment>
        );
    }
}

export default Movies;

