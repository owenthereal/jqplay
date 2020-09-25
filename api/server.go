package api

import (
	"bytes"
	"context"

	"github.com/jingweno/jqplay/jq"
	"google.golang.org/genproto/googleapis/rpc/errdetails"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type JQServer struct {
}

func (s *JQServer) PostRun(ctx context.Context, in *RunRequest) (*RunResponse, error) {
	var jqo []jq.JQOpt
	for _, o := range in.O {
		jqo = append(jqo, jq.JQOpt{Name: o, Enabled: true})
	}

	j := jq.JQ{
		J: in.J,
		Q: in.Q,
		O: jqo,
	}

	if err := j.Validate(); err != nil {
		return nil, status.Error(codes.InvalidArgument, err.Error())
	}

	b := bytes.NewBuffer(nil)
	if err := j.Eval(ctx, b); err != nil {
		s := status.New(codes.InvalidArgument, b.String())
		s, err := s.WithDetails(&errdetails.BadRequest{
			FieldViolations: []*errdetails.BadRequest_FieldViolation{
				{
					Field:       "exit_error",
					Description: err.Error(),
				},
			},
		})
		if err != nil {
			return nil, err
		}

		return nil, s.Err()
	}

	return &RunResponse{Out: b.String()}, nil
}
