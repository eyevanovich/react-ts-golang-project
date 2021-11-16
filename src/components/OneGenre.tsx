import React, { FC, Fragment, useState, useEffect } from 'react'
import { RouteComponentProps, StaticContext } from 'react-router'
import { Link } from 'react-router-dom'
import { Movie, GenreProps } from "./Interfaces";

type LocationState = {
    genreName: string
}

const OneGenre: FC<RouteComponentProps<GenreProps, StaticContext, LocationState>> = (props) => {
    // state for movies
    let [movies, setMovies] = useState<Movie[]>([])
    // state for if data is loaded or not (default false)
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [error, setError] = useState<Error>()
    const [genreName, setGenreName] = useState<string>("")

    const componentDidMount = () => {
        // API fetch call to go backend
        fetch(`${process.env.REACT_APP_API_URL}/v1/movies/` + props.match.params.id)
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
                setGenreName(props.location.state.genreName);
            },
                () => {
                    setIsLoaded(true);
                });
    };
    useEffect(componentDidMount, [props.location.state.genreName, props.match.params.id]);

    if (!movies) {
        movies = [];
    }

    if (error) {
        return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
        return <p>Loading...</p>;
    } else {
        return (
            <Fragment>
                <h2>Genre: {genreName}</h2>
                <div className="list-group">
                    {movies.map(movie => (
                        <Link to={`/movies/${movie.id}`} className="list-group-item list-group-item-action">{movie.title}</Link>
                    ))}
                </div>
            </Fragment>
        );
    }
}

export default OneGenre;