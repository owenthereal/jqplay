SHELL=/bin/bash -o pipefail

GOBIN ?= $(CURDIR)/build
.PHONY: build
build:
	yarn
	go build -o $(GOBIN)/jqplay ./cmd/jqplay

.PHONY: test
test:
	go test ./... -coverprofile=jqplay.c.out -covermode=atomic -count=1 -race -v


.PHONY: vet
vet:
	docker \
		run \
		--rm \
		-v $(CURDIR):/app \
		-w /app \
		golangci/golangci-lint:latest \
		golangci-lint run --timeout 5m -v

TAG ?= latest
REPO ?= ghcr.io/owenthereal/jqplay
.PHONY: docker_build
docker_build:
	docker buildx build --rm -t $(REPO):$(TAG) .

.PHONY: setup
setup:
	dropdb --if-exists jqplay
	createdb jqplay
	psql -d jqplay -f server/db.sql

.PHONY: start
start: setup build
	DATABASE_URL="dbname=jqplay sslmode=disable" ./build/jqplay
