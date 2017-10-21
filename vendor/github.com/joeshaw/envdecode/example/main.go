package main

/*

  In Terminal:

    # build the file
    go build -o example

    # set the environment variable
    TEST_STRING=Hello

    # run the code
    ./example

    # run the code with a different variable for
    # this particular execution of the program
    TEST_STRING=Goodbye ./example

*/

import (
	"log"

	"github.com/joeshaw/envdecode"
)

type config struct {
	TestString string `env:"TEST_STRING"`
}

func main() {

	var cfg config
	if err := envdecode.Decode(&cfg); err != nil {
		log.Fatalf("Failed to decode: %s", err)
	}

	log.Println("TEST_STRING:", cfg.TestString)

}
