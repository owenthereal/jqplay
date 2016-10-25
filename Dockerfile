FROM golang:1.7

RUN apt-get update && apt-get install -y --no-install-recommends \
		nodejs \
		npm \
	&& npm install --global grunt-cli bower \
	&& rm -rf /vr/lib/apt/lists/* \
	&& ln -s "$(which nodejs)" /usr/bin/node

ENV PORT 80

ADD . $GOPATH/src/github.com/jingweno/jqplay
WORKDIR $GOPATH/src/github.com/jingweno/jqplay
RUN bin/build
EXPOSE 80

CMD ["bin/jqplay"]
