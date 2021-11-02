import React, { FC, Fragment, useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router'
import { Movie } from "./Interfaces";


interface MovieProps {
    id: string,
}

const OneMovieGraphQL: FC<RouteComponentProps<MovieProps>> = (props) => {
    let newMovie: Movie = {} as Movie;
    const [movie, setMovie] = useState<Movie>(newMovie);
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [error, setError] = useState<Error>()

    const componentDidMount = () => {
        const payload = `
        { 
            movie (id: ${props.match.params.id}){
                id
                title
                runtime
                year
                description
                release_date
                rating
                mpaa_rating
                poster
            }
        }`

        const myHeaders: Headers = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "POST",
            body: payload,
            headers: myHeaders,
        }

        fetch("http://localhost:4000/v1/graphql", requestOptions)
            .then((response) => response.json())
            .then((data) => {
                setMovie(data.data.movie);
                setIsLoaded(true);
            });
            console.log(movie.poster)
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
                
                {movie.poster !== "" && (
                    <div>
                        <img src={`https://www.themoviedb.org/t/p/w200${movie.poster}`} alt="poster" />
                    </div>
                )}
                
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

export default OneMovieGraphQL;