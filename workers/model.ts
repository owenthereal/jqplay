import { z } from 'zod';

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']);
export const HttpHeadersSchema = z.record(z.string(), z.string());
const HttpSchema = z.object({
    method: HttpMethodSchema,
    url: z.string().url(),
    headers: HttpHeadersSchema.optional(),
    body: z.string().optional(),
});

export const JQWorkerInput = z.object({
    json: z.string().optional(),
    http: HttpSchema.optional(),
    query: z.string().min(1),
    options: z.array(z.string().min(1)).optional(),
}).refine(data => data.json || data.http, {
    message: 'Either json or http must be provided',
    path: ['json', 'http'],
});

export type HttpMethodType = z.infer<typeof HttpMethodSchema>;
export type HttpType = z.infer<typeof HttpSchema>;
export type JQWorkerInputType = z.infer<typeof JQWorkerInput>
