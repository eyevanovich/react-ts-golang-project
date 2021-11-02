import React, { FC, useState, useEffect, Fragment } from 'react'
import { Link } from 'react-router-dom';
import { Genre } from "./Interfaces";

const Genres: FC = (props) => {
    // state for genres
    const [genres, setGenres] = useState<Genre[]>([]);
    // state for if data is loaded or not (default false)
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [error, setError] = useState<Error>()

    const componentDidMount = () => {
        // API fetch call to go backend
        fetch("http://localhost:4000/v1/genres")
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
                setGenres(json.genres);
                setIsLoaded(true);
            }, () => {
                setIsLoaded(true);
            });
    };

    useEffect(() => {componentDidMount()}, []);
    
    if (error) {
        return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
        return <p>Loading...</p>;
    } else {
        return (
            <Fragment>
                <h2>Genres</h2>
                <ul>
                    {genres.map(genre => (
                        <div key={genre.id} className="list-group">
                            {/* This method will allow us to share state to other components */}
                            <Link key={genre.id} className="list-group-item list-group-item-action" to={{
                                pathname: `/genre/${genre.id}`,
                                state: { genreName: genre.genre_name },
                            }}>{genre.genre_name}
                            </Link>
                        </div>
                    ))}
                </ul>
            </Fragment>
        );
    }
}

export default Genres;