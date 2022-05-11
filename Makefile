SHELL=/bin/bash -o pipefail

GOBIN ?= $(CURDIR)/bin
.PHONY: build
build:
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
