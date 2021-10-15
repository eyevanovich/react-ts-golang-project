import React, { FC } from "react";
import Ticket from "./images/movie_tickets.jpg";
import "./Home.css";

const Home: FC = (props) => {
    return (
        <div className="text-center">
            <h2>Home Page</h2>
            <hr />
            {/* image import way 1 */}
            <img src={Ticket} alt="movie ticket" />
            <hr />
            {/* image import way 2 from CSS */}
            <div className="tickets"></div>
        </div>
    )
}

export default Home;