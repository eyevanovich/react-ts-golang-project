package main

import (
	"backend-app/models"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/julienschmidt/httprouter"
)

type jsonResp struct {
	OK      bool   `json:"ok"`
	Message string `json:"message"`
}

func (app *application) getOneMovie(rw http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())

	id, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		app.logger.Println(errors.New("invalid id parameter"))
		app.errorJSON(rw, err)
		return
	}

	movie, err := app.models.Db.Get(id)
	if err != nil {
		app.logger.Fatal(err)
	}

	err = app.writeJSON(rw, http.StatusOK, movie, "movie")
	if err != nil {
		app.logger.Fatal(err)
	}

}

func (app *application) getAllMovies(rw http.ResponseWriter, r *http.Request) {
	movies, err := app.models.Db.All()
	if err != nil {
		app.errorJSON(rw, err)
		return
	}

	err = app.writeJSON(rw, http.StatusOK, movies, "movies")
	if err != nil {
		app.errorJSON(rw, err)
		return
	}
}

func (app *application) getAllGenres(rw http.ResponseWriter, r *http.Request) {
	genres, err := app.models.Db.GenresAll()
	if err != nil {
		app.errorJSON(rw, err)
		return
	}
	err = app.writeJSON(rw, http.StatusOK, genres, "genres")
	if err != nil {
		app.errorJSON(rw, err)
		return
	}
}

func (app *application) getAllMoviesByGenre(rw http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())

	genreId, err := strconv.Atoi(params.ByName("genre_id"))
	if err != nil {
		app.errorJSON(rw, err)
		return
	}

	movies, err := app.models.Db.All(genreId)
	if err != nil {
		app.errorJSON(rw, err)
		return
	}

	err = app.writeJSON(rw, http.StatusOK, movies, "movies")
	if err != nil {
		app.errorJSON(rw, err)
		return
	}
}

type MoviePayload struct {
	Id          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Year        string `json:"year"`
	ReleaseDate string `json:"release_date"`
	Runtime     string `json:"runtime"`
	Rating      string `json:"rating"`
	MPAARating  string `json:"mpaa_rating"`
}

func (app *application) editMovie(rw http.ResponseWriter, r *http.Request) {
	var payload MoviePayload

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		app.errorJSON(rw, err)
		return
	}

	var movie models.Movie

	if payload.Id != "0" {
		id, _ := strconv.Atoi(payload.Id)
		m, _ := app.models.Db.Get(id)
		movie = *m

		movie.UpdatedAt = time.Now()
	}

	movie.Id, _ = strconv.Atoi(payload.Id)
	movie.Title = payload.Title
	movie.Description = payload.Description
	movie.ReleaseDate, _ = time.Parse("2006-01-02", payload.ReleaseDate)
	movie.Year = movie.ReleaseDate.Year()
	movie.Runtime, _ = strconv.Atoi(payload.Runtime)
	movie.Rating, _ = strconv.Atoi(payload.Rating)
	movie.MPAARating = payload.MPAARating
	movie.CreatedAt = time.Now()
	movie.UpdatedAt = time.Now()

	if movie.Poster == "" {
		movie = getPoster(movie)
	}

	if movie.Id == 0 {
		err = app.models.Db.InsertMovie(movie)
		if err != nil {
			app.errorJSON(rw, err)
			return
		}
	} else {
		err = app.models.Db.UpdateMovie(movie)
		if err != nil {
			app.errorJSON(rw, err)
			return
		}
	}

	ok := jsonResp{
		OK: true,
	}

	err = app.writeJSON(rw, http.StatusOK, ok, "response")
	if err != nil {
		app.logger.Println(err.Error())
		app.errorJSON(rw, err)
		return
	}
}

func (app *application) deleteMovie(rw http.ResponseWriter, r *http.Request) {
	// This should work but it doesn't
	// params := httprouter.ParamsFromContext(r.Context())
	params := r.Context().Value("params")
	id, err := strconv.Atoi(params.(httprouter.Params).ByName("id"))
	if err != nil {
		app.logger.Println(err.Error())
		app.errorJSON(rw, err)
		return
	}

	err = app.models.Db.DeleteMovie(id)
	if err != nil {
		app.logger.Println(err.Error())
		app.errorJSON(rw, err)
		return
	}

	ok := jsonResp{
		OK: true,
	}

	err = app.writeJSON(rw, http.StatusOK, ok, "response")
	if err != nil {
		app.logger.Println(err.Error())
		app.errorJSON(rw, err)
		return
	}

}

func getPoster(movie models.Movie) models.Movie {
	type TheMovieDB struct {
		Page    int `json:"page"`
		Results []struct {
			Adult            bool    `json:"adult"`
			BackdropPath     string  `json:"backdrop_path"`
			GenreIds         []int   `json:"genre_ids"`
			ID               int     `json:"id"`
			OriginalLanguage string  `json:"original_language"`
			OriginalTitle    string  `json:"original_title"`
			Overview         string  `json:"overview"`
			Popularity       float64 `json:"popularity"`
			PosterPath       string  `json:"poster_path"`
			ReleaseDate      string  `json:"release_date"`
			Title            string  `json:"title"`
			Video            bool    `json:"video"`
			VoteAverage      float64 `json:"vote_average"`
			VoteCount        int     `json:"vote_count"`
		} `json:"results"`
		TotalPages   int `json:"total_pages"`
		TotalResults int `json:"total_results"`
	}

	client := &http.Client{}
	key := "6ddbedb82a1df3e5b9eb433fe9e024c1"
	theUrl := "https://api.themoviedb.org/3/search/movie?api_key="
	log.Println(theUrl + key + "&query=" + url.QueryEscape(movie.Title))

	req, err := http.NewRequest("GET", theUrl+key+"&query="+url.QueryEscape(movie.Title), nil)
	if err != nil {
		log.Println(err)
		return movie
	}

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Println(err)
		return movie
	}
	defer resp.Body.Close()
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println(err)
		return movie
	}

	var responseObject TheMovieDB

	json.Unmarshal(bodyBytes, &responseObject)

	if len(responseObject.Results) > 0 {
		movie.Poster = responseObject.Results[0].PosterPath
	}

	return movie
}
