package main

import (
	"backend-app/models"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/graphql-go/graphql"
)

var movies []*models.Movie

// GraphQL schema definition
var fields = graphql.Fields{
	"movie": &graphql.Field{
		Type:        movieType,
		Description: "Get movie by id",
		Args: graphql.FieldConfigArgument{
			"id": &graphql.ArgumentConfig{
				Type: graphql.Int,
			},
		},
		Resolve: func(p graphql.ResolveParams) (interface{}, error) {
			id, ok := p.Args["id"].(int)
			if ok {
				for _, movie := range movies {
					if movie.Id == id {
						return movie, nil
					}
				}
			}
			return nil, nil
		},
	},
	"list": &graphql.Field{
		Type:        graphql.NewList(movieType),
		Description: "Get all movies",
		Resolve: func(p graphql.ResolveParams) (interface{}, error) {
			return movies, nil
		},
	},
}

var movieType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Movie",
	Fields: graphql.Fields{
		"id": &graphql.Field{
			Type: graphql.Int,
		},
		"title": &graphql.Field{
			Type: graphql.String,
		},
		"description": &graphql.Field{
			Type: graphql.String,
		},
		"year": &graphql.Field{
			Type: graphql.String,
		},
		"release_date": &graphql.Field{
			Type: graphql.DateTime,
		},
		"runtime": &graphql.Field{
			Type: graphql.Int,
		},
		"rating": &graphql.Field{
			Type: graphql.Int,
		},
		"mpaa_rating": &graphql.Field{
			Type: graphql.String,
		},
		"created_at": &graphql.Field{
			Type: graphql.DateTime,
		},
		"updated_at": &graphql.Field{
			Type: graphql.DateTime,
		},
	},
})

func (app *application) moviesGraphQL(rw http.ResponseWriter, r *http.Request) {
	movies, _ = app.models.Db.All()

	q, err := io.ReadAll(r.Body)
	if err != nil {
		app.logger.Println(err)
		return
	}

	query := string(q)

	app.logger.Println(query)

	rootQuery := graphql.ObjectConfig{Name: "RootQuery", Fields: fields}
	schemaConf := graphql.SchemaConfig{Query: graphql.NewObject(rootQuery)}
	schema, err := graphql.NewSchema(schemaConf)
	if err != nil {
		app.errorJSON(rw, errors.New("failed to create schema"))
		app.logger.Println(err)
	}

	params := graphql.Params{Schema: schema, RequestString: query}
	res := graphql.Do(params)
	if len(res.Errors) > 0 {
		app.errorJSON(rw, errors.New(fmt.Sprintf("failed: %+v", res.Errors)))
	}

	json, _ := json.MarshalIndent(res, "", "  ")
	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(json)
}
