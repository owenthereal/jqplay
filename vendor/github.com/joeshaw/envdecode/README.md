# envdecode #

`envdecode` is a Go package for populating structs from environment
variables.

`envdecode` uses struct tags to map environment variables to fields,
allowing you you use any names you want for environment variables.
`envdecode` will recurse into nested structs, including pointers to
nested structs, but it will not allocate new pointers to structs.

## API ##

Full API docs are available on
[godoc.org](http://godoc.org/github.com/joeshaw/envdecode).

Define a struct with `env` struct tags:

```go
type Config struct {
    Hostname  string `env:"SERVER_HOSTNAME,default=localhost"`
    Port      uint16 `env:"SERVER_PORT,default=8080"`

    AWS struct {
        ID        string   `env:"AWS_ACCESS_KEY_ID"`
        Secret    string   `env:"AWS_SECRET_ACCESS_KEY,required"`
        SnsTopics []string `env:"AWS_SNS_TOPICS"`
    }

    Timeout time.Duration `env:"TIMEOUT,default=1m"`
}
```

Fields *must be exported* (i.e. begin with a capital letter) in order
for `envdecode` to work with them.  An error will be returned if a
struct with no exported fields is decoded (including one that contains
no `env` tags at all).

Then call `envdecode.Decode`:

```go
var cfg Config
err := envdecode.Decode(&cfg)
```

## Supported types ##

* Structs (and pointer to structs)
* Slices of below defined types, separated by semicolon
* `bool`
* `float32`, `float64`
* `int`, `int8`, `int16`, `int32`, `int64`
* `uint`, `uint8`, `uint16`, `uint32`, `uint64`
* `string`
* `time.Duration`, using the [`time.ParseDuration()` format](http://golang.org/pkg/time/#ParseDuration)
* `*url.URL`, using [`url.Parse()`](https://godoc.org/net/url#Parse)
