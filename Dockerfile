FROM golang:latest as builder

RUN apt-get update && apt-get install -y --no-install-recommends \
		nodejs \
		npm \
	&& npm install --global yarn \
	&& rm -rf /vr/lib/apt/lists/*

WORKDIR $GOPATH/src/github.com/owenthereal/jqplay
ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64 GOBIN=$GOPATH/bin
COPY . .
RUN make build

FROM gcr.io/distroless/static

MAINTAINER Owen Ou
LABEL org.opencontainers.image.source https://github.com/owenthereal/jqplay

USER nobody:nobody

COPY --from=builder /go/bin/jqplay /app/jqplay/jqplay
COPY --from=builder /go/src/github.com/owenthereal/jqplay/bin/linux_amd64/* /app/jqplay/bin/linux_amd64/

WORKDIR /app/jqplay
ENV PATH "/app/jqplay:${PATH}"

ENV PORT 8080
EXPOSE 8080

ENTRYPOINT ["jqplay"]
