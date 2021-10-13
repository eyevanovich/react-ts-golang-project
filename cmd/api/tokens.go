package main

import (
	"backend-app/models"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/pascaldekloe/jwt"
	"golang.org/x/crypto/bcrypt"
)

var validUser = models.User{
	Id:       10,
	Email:    "me@here.com",
	Password: "$2a$12$c4DyXCrAtWSijQFdQzNxe..RXLR5HfKDcyZkPBqLmdpVB/schmZvi",
}

type Credentials struct {
	Username string `json:"email"`
	Password string `json:"password"`
}

func (app *application) Signin(rw http.ResponseWriter, r *http.Request) {
	var creds Credentials

	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		app.errorJSON(rw, errors.New("unauthorized"))
		return
	}

	hashedPassword := validUser.Password

	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(creds.Password))
	if err != nil {
		app.errorJSON(rw, errors.New("unauthorized"))
		return
	}

	var claims jwt.Claims

	claims.Subject = fmt.Sprint(validUser.Id)
	claims.Issued = jwt.NewNumericTime(time.Now())
	claims.NotBefore = jwt.NewNumericTime(time.Now())
	claims.Expires = jwt.NewNumericTime(time.Now().Add(24 * time.Hour))
	claims.Issuer = "thedomain.com"
	claims.Audiences = []string{"thedomain.com"}

	jwtBytes, err := claims.HMACSign(jwt.HS256, []byte(app.config.jwt.secret))
	if err != nil {
		app.errorJSON(rw, errors.New("error signing"))
		return
	}

	app.writeJSON(rw, http.StatusOK, string(jwtBytes), "response")
}
