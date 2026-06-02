package main

import (
	"context"
	"log"
	"time"

	"github.com/bxcodec/faker/v3"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	db, err := pgxpool.New(context.Background(),
		"postgres://user:password@localhost:5432/yourdb")
	if err != nil {
		log.Fatal(err)
	}

	for i := 0; i < 30; i++ {

		firstName := faker.FirstName()
		lastName := faker.LastName()
		email := faker.Email()
		city := faker.Word()

		_, err := db.Exec(context.Background(), `
			INSERT INTO users (first_name, last_name, email, city, birth_date, created_at)
			VALUES ($1, $2, $3, $4, $5, $6)
		`,
			firstName,
			lastName,
			email,
			city,
			time.Now(),
			time.Now(),
		)

		if err != nil {
			log.Println("error:", err)
		}
	}

	log.Println("DONE: users created")
}