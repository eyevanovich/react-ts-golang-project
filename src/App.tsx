import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Movies from './components/Movies';
import Home from './components/Home';
import Admin from './components/Admin';
import Genres from './components/Genres';
import OneMovie from './components/OneMovie';
import OneGenre from './components/OneGenre';
import EditMovie from './components/EditMovie';
import { LoginProps, Token, TokenProps, EditState } from './components/Interfaces';
import React, { FC, useState, Fragment, useEffect } from 'react';
import Login from './components/Login';
import { RouteComponentProps } from 'react-router'
import GraphQL from './components/GraphQL';
import OneMovieGraphQL from './components/OneMovieGraphQL';

const App: FC = (props) => {
  const [jwt, setJwt] = useState<Token>({ jwt: "" })

  const handleJwtChange = (jwt: string) => {
    setJwt({ jwt: jwt });
  }

  const logout = () => {
    setJwt({ jwt: "" });
    window.localStorage.removeItem("jwt");
  }

  const componentDidMount = () => {
    let t = window.localStorage.getItem("jwt")
    if (t) {
      if(jwt.jwt === ""){
        setJwt(JSON.parse(t))
      }
    }
  }

  useEffect(componentDidMount,[jwt.jwt]);

  let loginLink;
  if (jwt.jwt === "") {
    loginLink = <Link to="/login">Login</Link>
  } else {
    loginLink = <Link to="/logout" onClick={logout}>Logout</Link>
  }

  return (
    <Router>
      <div className="contianer-md p-5">
        <div className="row">
          <div className="col mt-3">
            <h1 className="mt-3">
              Sky Movies
            </h1>
          </div>
          <div className="col mt-3 text-end">
            {loginLink}
          </div>
          <hr className="mb-3"></hr>
        </div>

        <div className="row">
          <div className="col-md-2">
            <nav>
              <ul className="list-group">
                <li className="list-group-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/movies">Movies</Link>
                </li>
                <li className="list-group-item">
                  <Link to="/genres">Genres</Link>
                </li>
                {jwt.jwt !== "" && (<Fragment>
                  <li className="list-group-item">
                    <Link to="/admin/movie/0">Add Movie</Link>
                  </li>

                  <li className="list-group-item">
                    <Link to="/admin">Manage Catalog</Link>
                  </li>
                </Fragment>
                )}
                <li className="list-group-item">
                  <Link to="/graphql">GraphQL</Link>
                </li>
              </ul>
              <pre>
                {JSON.stringify(jwt, null, 3)}
              </pre>
            </nav>
          </div>

          <div className="col-md-10">
            <Switch>
              {/* Nested Routing */}
              {/* Single Movie Route*/}
              <Route path="/movies/:id" component={OneMovie} />
              <Route path="/movies-graphql/:id" component={OneMovieGraphQL} />
              
              {/* All Movies Route */}
              <Route path="/movies">
                <Movies />
              </Route>
              
              {/* Single Genre Route */}
              <Route path="/genre/:id" component={OneGenre} />
              
              {/* All Genrese Route */}
              <Route exact path="/genres">
                <Genres />
              </Route>
              
              {/* Admin Movie Route */}
              <Route exact path="/admin/movie/:id"
                component={
                  (props: RouteComponentProps<EditState> & TokenProps) =>
                    <EditMovie {...props} token={jwt} />
                }
              />
              
              {/* Admin Route */}
              <Route path="/admin" component={(props: TokenProps) =>
                <Admin {...props} token={jwt} />}
              />
              
              {/* Login Route */}
              <Route exact path="/login" component={(props: LoginProps) =>
                <Login {...props} handleJwtChange={handleJwtChange} />}
              />
              
              {/* GraphQL Route */}
              <Route exact path="/graphql">
                <GraphQL/>
              </Route>
              
              {/* DO NOT PUT OTHER ROUTES BELOW HOME ROUTE */}
              {/* Home Route */}
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </Router >
  );
}

export default App;