import React, { FC, Fragment, useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router'
import { Movie } from "./Interfaces";


interface MovieProps {
    id: string,
}

const OneMovie: FC<RouteComponentProps<MovieProps>> = (props) => {
    let newMovie: Movie = {} as Movie;
    const [movie, setMovie] = useState<Movie>(newMovie);
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [error, setError] = useState<Error>()

    const componentDidMount = () => {
        // API fetch call to go backend
        fetch("http://localhost:4000/v1/movie/" + props.match.params.id)
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
                setMovie(json.movie);
                setIsLoaded(true);
            },
                () => {
                    setIsLoaded(true);
                });
    };

    useEffect(componentDidMount, [props.match.params.id]);

    let genreArray: string[] = [];
    if (movie.genres) {
        genreArray = Object.values(movie.genres)
    }

    if (error) {
        return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
        return <p>Loading...</p>;
    } else {
        return (
            <Fragment>
                <h2>Movie: {movie.title} ({movie.year})</h2>
                <div className="float-start">
                    <small>Rating: {movie.mpaa_rating}</small>
                </div>
                <div className="float-end">
                    <small>{genreArray.map((m, index) => (
                        <span className="badge bg-secondary me-1" key={index}>
                            {m}
                        </span>
                    ))}</small>
                </div>
                <div className="clearfix"></div>
                <hr />
                <table className="table table-compact table-striped">
                    <thead></thead>
                    <tbody>
                        <tr>
                            <td><strong>Title:</strong></td>
                            <td>{movie.title}</td>
                        </tr>
                        <tr>
                            <td><strong>Description:</strong></td>
                            <td>{movie.description}</td>
                        </tr>
                        <tr>
                            <td><strong>Run Time:</strong></td>
                            <td>{movie.runtime} minutes</td>
                        </tr>
                    </tbody>
                </table>
            </Fragment>
        )
    }
}

export default OneMovie;