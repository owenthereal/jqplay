FROM --platform=$BUILDPLATFORM ubuntu as jqbuilder

ARG JQ_TAG=jq-1.6

ENV DEBIAN_FRONTEND=noninteractive \
    DEBCONF_NONINTERACTIVE_SEEN=true \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8

RUN apt-get update && \
    apt-get install -y \
        build-essential \
        autoconf \
        libtool \
        git \
        bison \
        flex \
        python3 \
        python3-pip \
        wget && \
    pip3 install pipenv

RUN git clone --recurse-submodules https://github.com/stedolan/jq.git && \
    cd jq && \
    git checkout $JQ_TAG && \
    autoreconf -i && \
    ./configure --disable-dependency-tracking --disable-silent-rules --disable-maintainer-mode --prefix=/usr/local && \
    make install

FROM --platform=$BUILDPLATFORM golang:latest as gobuilder
ARG TARGETOS TARGETARCH

RUN apt update && apt install -y --no-install-recommends curl
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash
RUN apt install -y --no-install-recommends \
		nodejs \
	&& npm install --global yarn \
	&& rm -rf /vr/lib/apt/lists/*

WORKDIR $GOPATH/src/github.com/owenthereal/jqplay

ENV CGO_ENABLED=0 GOBIN=$GOPATH/bin GOOS=$TARGETOS GOARCH=$TARGETARCH GOFLAGS="-buildvcs=false"
COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg \
    make build

FROM ubuntu

MAINTAINER Owen Ou
LABEL org.opencontainers.image.source https://github.com/owenthereal/jqplay

RUN useradd -m jqplay
USER jqplay

WORKDIR /app
ENV PATH="/app:${PATH}"

COPY --from=jqbuilder /usr/local/bin/jq /app
COPY --from=gobuilder /go/bin/* /app

ENV PORT 8080
EXPOSE 8080

ENTRYPOINT ["jqplay"]
