SHELL=/bin/bash -o pipefail

.PHONY: build
build: client
	cp "$$(go env GOROOT)/misc/wasm/wasm_exec.js" web/assets
	GOOS=js GOARCH=wasm go build -o web/assets/main.wasm ./web/...
	go-bindata -o api/bindata.go -pkg api -fs -prefix "web/assets" ./web/assets
	go build -o ./bin/jqp ./cmd/jqp

.PHONY: proto
proto:
	# TODO: dockerize
	protoc \
		-I api \
		-I $$(go env GOPATH)/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
		--go_out=plugins=grpc:api \
		./api/api.proto
	protoc \
		-I api \
		-I $$(go env GOPATH)/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
		--grpc-gateway_out=logtostderr=true:api \
		./api/api.proto
	protoc \
		-I api \
		-I $$(go env GOPATH)/src/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis \
		--swagger_out=logtostderr=true:api \
		./api/api.proto

.PHONY: client
client: proto
	rm -rf api/swagger
	mkdir -p api/swagger
	docker \
		run \
		--rm \
		-e GOPATH=/go \
		--volume $(CURDIR):/go/src/github.com/jingweno/jqplay \
		-w /go/src/github.com/jingweno/jqplay quay.io/goswagger/swagger \
		generate client -t api/swagger -f ./api/api.swagger.json

.PHONY: init
init:
	go get -u github.com/go-bindata/go-bindata/...
