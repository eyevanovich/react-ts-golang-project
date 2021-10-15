package main

import (
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/pascaldekloe/jwt"
)

func (app *application) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		rw.Header().Set("Access-Control-Allow-Origin", "*")
		rw.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
		next.ServeHTTP(rw, r)
	})
}

func (app *application) checkToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		rw.Header().Set("Vary", "Authorization")

		authHeader := r.Header.Get("Authorization")

		// if authHeader == "" {
		// could set an anon user here
		// }

		headerParts := strings.Split(authHeader, " ")
		log.Println(len(headerParts))
		if len(headerParts) != 2 {
			app.errorJSON(rw, errors.New("invalid auth header"))
			return
		}
		if headerParts[0] != "Bearer" {
			app.errorJSON(rw, errors.New("unauthorized: no bearer"))
			return
		}

		token := headerParts[1]

		claims, err := jwt.HMACCheck([]byte(token), []byte(app.config.jwt.secret))
		if err != nil {
			app.errorJSON(rw, errors.New("unauthorized: failed hmac check"), http.StatusForbidden)
			return
		}

		if !claims.Valid(time.Now()) {
			app.errorJSON(rw, errors.New("unauthorized: token expired"), http.StatusForbidden)
			return
		}

		if !claims.AcceptAudience("thedomain.com") {
			app.errorJSON(rw, errors.New("unauthorized: invalid audience"), http.StatusForbidden)
			return
		}

		if claims.Issuer != "thedomain.com" {
			app.errorJSON(rw, errors.New("unauthorized: invalid issuer"), http.StatusForbidden)
			return
		}

		userId, err := strconv.ParseInt(claims.Subject, 10, 64)
		if err != nil {
			app.errorJSON(rw, errors.New("unauthorized"), http.StatusForbidden)
			return
		}

		log.Println("Valid User:", userId)

		next.ServeHTTP(rw, r)
	})
}
