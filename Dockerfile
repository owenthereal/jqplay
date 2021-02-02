FROM golang:latest

RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
		nodejs \
    && curl -sL https://deb.nodesource.com/setup_8.x > /bin/getnpm \
	&& chmod +x /bin/getnpm \
	&& /bin/getnpm \
	&& apt-get -y install npm \
	&& npm install --global grunt-cli bower \
	&& rm -rf /vr/lib/apt/lists/* 

ENV PORT 80

ADD . $GOPATH/src/github.com/jingweno/jqplay
WORKDIR $GOPATH/src/github.com/jingweno/jqplay
RUN bin/build
EXPOSE 80

CMD ["bin/jqplay"]
