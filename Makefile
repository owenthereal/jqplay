SHELL=/bin/bash -o pipefail

.PHONY: build
build:
	cp "$$(go env GOROOT)/misc/wasm/wasm_exec.js" web/assets
	GOOS=js GOARCH=wasm go build -o web/assets/main.wasm ./web/...
	go-bindata -o api/bindata.go -pkg api -fs -prefix "web/assets" ./web/assets
	go build -o ./bin/jqp ./cmd/jqp

.PHONY: generate
generate: proto client

.PHONY: proto
proto:
	docker run \
		--rm \
		-v $(CURDIR)/api:/defs \
		namely/protoc-all  \
		-f api.proto --with-gateway -l go -o .

.PHONY: client
client: proto
	rm -rf api/swagger
	mkdir -p api/swagger
	docker run \
		--rm \
		-e GOPATH=/go \
		-v $(CURDIR):/go/src/github.com/owenthereal/jqplay \
		-w /go/src/github.com/owenthereal/jqplay \
		quay.io/goswagger/swagger \
		generate client -t api/swagger -f ./api/api.swagger.json

.PHONY: init
init:
	go get -u github.com/go-bindata/go-bindata/...
