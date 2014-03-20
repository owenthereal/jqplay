package main

import (
	"strings"

	"github.com/jingweno/jqpipe-go"
)

func JQ(json, query string) (string, error) {
	seq, err := jq.Eval(json, query)
	if err != nil {
		return "", err
	}

	result := []string{}
	for _, s := range seq {
		result = append(result, string(s))
	}

	return strings.Join(result, "\n"), nil
}
