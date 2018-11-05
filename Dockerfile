FROM golang:1.11.2

ENV NODE_VERSION=node_8.x DISTRO=stretch

RUN apt-get update && apt-get install -y --no-install-recommends apt-transport-https \
	&& curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - \
	&& echo "deb https://deb.nodesource.com/$NODE_VERSION $DISTRO main" | tee /etc/apt/sources.list.d/nodesource.list \
	&& echo "deb-src https://deb.nodesource.com/$NODE_VERSION $DISTRO main" | tee -a /etc/apt/sources.list.d/nodesource.list \
	&& apt-get update \
	&& apt-get install -y --no-install-recommends nodejs \
	&& npm install --global grunt-cli bower \
	&& rm -rf /vr/lib/apt/lists/*

ENV PORT 80

ADD . $GOPATH/src/github.com/jingweno/jqplay
WORKDIR $GOPATH/src/github.com/jingweno/jqplay
RUN bin/build
EXPOSE 80

CMD ["bin/jqplay"]
