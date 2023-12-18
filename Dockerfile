FROM ubuntu as jqbuilder

ARG JQ_TAG=jq-1.7.1

ENV DEBIAN_FRONTEND=noninteractive \
    DEBCONF_NONINTERACTIVE_SEEN=true \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8

RUN apt-get update && \
    apt-get install -y \
    build-essential \
    autoconf \
    libtool \
    git

RUN git clone --recurse-submodules https://github.com/jqlang/jq.git && \
    cd jq && \
    git checkout $JQ_TAG && \
    autoreconf -i && \
    ./configure \
    --disable-dependency-tracking \
    --disable-valgrind \
    --with-oniguruma=builtin \
    --enable-static \
    --enable-all-static \
    --prefix=/usr/local && \
    make install

FROM golang:latest as gobuilder
ARG TARGETOS TARGETARCH

RUN apt update && apt install -y --no-install-recommends curl gpg
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt install -y --no-install-recommends \
    nodejs \
    npm \
    && npm install --global yarn

WORKDIR $GOPATH/src/github.com/owenthereal/jqplay

ENV CGO_ENABLED=0 GOBIN=$GOPATH/bin GOOS=$TARGETOS GOARCH=$TARGETARCH GOFLAGS="-buildvcs=false"
COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg \
    make build

FROM ubuntu

RUN useradd -m jqplay
USER jqplay

WORKDIR /app
ENV PATH="/app:${PATH}"

COPY --from=jqbuilder /usr/local/bin/jq /app
COPY --from=gobuilder /go/bin/* /app

ENV PORT 8080
EXPOSE 8080

ENTRYPOINT ["jqplay"]
