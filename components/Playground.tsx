import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Container, Grid, Link, Typography } from '@mui/material';
import Header from './Header';
import JSONEditor from './JSONEditor';
import QueryEditor from './QueryEditor';
import OptionsSelector from './OptionsSelector';
import OutputEditor from './OutputEditor';
import { ThemeProvider } from './ThemeProvider';
import { Notification, NotificationProps } from './Notification';
import { currentUnixTimestamp, generateMessageId, normalizeLineBreaks } from '@/lib/utils';
import { loader } from '@monaco-editor/react';
import { JQWorker } from '@/workers';
import { useRouter } from 'next/navigation';
import { HttpHeadersSchema, HttpMethodType, HttpType, JQWorkerInput, JQWorkerInputType } from '@/workers/model';
import { set, ZodError } from 'zod';

const runTimeout = 30000;

loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs' } });

class RunError extends Error {
    runId: number;
    constructor(runID: number, message: string) {
        super(message);
        this.runId = runID;
    }
}

class RunResult {
    runId: number;
    result: string;
    constructor(runID: number, result: string) {
        this.runId = runID;
        this.result = result;
    }
}

export interface PlaygroundProps {
    input?: JQWorkerInputType
}

export function Playground({ input }: PlaygroundProps) {
    return (
        <ThemeProvider>
            <PlaygroundElement input={input} />
        </ThemeProvider>
    );
}

function PlaygroundElement({ input }: PlaygroundProps) {
    const router = useRouter();
    const [result, setResult] = useState<string>('');

    const [http, setHttp] = useState<HttpType | undefined>(input?.http);
    const [json, setJson] = useState<string | undefined>(input?.json);
    const [query, setQuery] = useState<string>(input?.query || '');
    const [options, setOptions] = useState<string[]>(input?.options || []);

    const [minPlaygroundWidth, setMinPlaygroundWidth] = useState<string>('100%');
    const [minEditorHeight, setMinEditorHeight] = useState<number>(0);
    const [minQueryEditorHeight, setQueryMinEditorHeight] = useState<number>(0);
    const [notification, setNotification] = useState<NotificationProps | null>(null);

    const workerRef = useRef<JQWorker | null>(null);
    const runIdRef = useRef<number | null>(null);
    const runTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const terminateWorker = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }
    }, []);

    const clearRunTimeout = useCallback(() => {
        if (runTimeoutRef.current) {
            clearTimeout(runTimeoutRef.current);
            runTimeoutRef.current = null;
        }
        runIdRef.current = null;
    }, []);

    const updateMinHeight = useCallback(() => {
        const height = window.innerHeight - 64 - 110 - 21;
        const editorHeight = height * 2 / 3;
        const queryEditorHeight = height / 3;
        const minHeight = 35 * 4;
        setMinEditorHeight(Math.max(editorHeight, minHeight));
        setQueryMinEditorHeight(Math.max(queryEditorHeight, minHeight));

        const width = window.innerWidth;
        setMinPlaygroundWidth(width >= 1280 ? '1280px' : '100%');
    }, []);

    useEffect(() => {
        updateMinHeight();
        window.addEventListener('resize', updateMinHeight);
        return () => {
            window.removeEventListener('resize', updateMinHeight);
            clearRunTimeout();
            terminateWorker();
        };
    }, [updateMinHeight, clearRunTimeout, terminateWorker]);

    const runJQ = useCallback((runId: number, json: string | undefined, http: HttpType | undefined, query: string, options: string[], timeout: number): Promise<RunResult> => {
        terminateWorker();
        return new Promise<RunResult>((resolve, reject) => {
            try {
                const worker = new JQWorker(timeout);
                workerRef.current = worker;

                const jqi = JQWorkerInput.parse({
                    json: json,
                    http: http,
                    query: query,
                    options: options
                });
                worker.run(jqi)
                    .then(result => resolve(new RunResult(runId, result)))
                    .catch(error => reject(new RunError(runId, error.message)));
            } catch (error: any) {
                reject(new RunError(runId, error.message));
            }
        });
    }, [terminateWorker]);

    const handleJQRun = useCallback((json: string | undefined, http: HttpType | undefined, query: string, options: string[]) => {
        clearRunTimeout();
        setResult('');

        if ((!json && !http) || query === '') return;

        setResult('Running...');
        const runId = currentUnixTimestamp();
        runIdRef.current = runId;

        runTimeoutRef.current = setTimeout(() => {
            runJQ(runId, json, http, query, options, runTimeout)
                .then(result => {
                    if (runIdRef.current === result.runId) {
                        setResult(result.result);
                    }
                })
                .catch(error => {
                    if (runIdRef.current === error.runId) {
                        setResult(`Error: ${error.message}`);
                    }
                });
        }, 500);
    }, [clearRunTimeout, runJQ]);

    useEffect(() => {
        handleJQRun(json, http, query, options);
    }, [json, http, query, options, handleJQRun]);

    const handleJSONEditorChange = useCallback((value: string | undefined) => {
        setJson(value ? normalizeLineBreaks(value) : undefined);
        setHttp(undefined);
    }, []);

    const handleQueryEditorChange = useCallback((value: string | undefined) => {
        if (value) setQuery(normalizeLineBreaks(value));
    }, []);

    const handleOptionsSelectorChange = useCallback((options: string[]) => {
        setOptions(options);
    }, []);

    const handleHttp = useCallback((method: HttpMethodType, url: string, headers?: string, body?: string) => {
        try {
            const parsedHeaders = headers ? HttpHeadersSchema.parse(JSON.parse(headers)) : undefined;

            const http: HttpType = {
                method,
                url,
                headers: parsedHeaders,
                body,
            };

            setHttp(http);
            setJson(undefined);
        } catch (error: any) {
            if (error instanceof ZodError) {
                const errorMessage = error.errors.map((e) => e.message).join(', ');
                setNotification({
                    message: `Invalid headers: ${errorMessage}`,
                    messageId: generateMessageId(),
                    serverity: 'error'
                });
            } else {
                setNotification({
                    message: 'Invalid headers: Headers must be a valid JSON object with key-value pairs.',
                    messageId: generateMessageId(),
                    serverity: 'error'
                });
            }
        }
    }, []);

    const handleShare = useCallback(async () => {
        if ((!json && !http) || !query) {
            setNotification({ message: 'Please provide a Query and either JSON or HTTP data.', messageId: generateMessageId(), serverity: 'error' });
            return;
        }

        try {
            const body = { json: json, http: http, query: query, options: options }
            const response = await fetch('/api/snippets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.errors ? data.errors.join(', ') : response.statusText);

            router.push(`/s/${data.slug}`);
        } catch (error: any) {
            setNotification({ message: error.message, messageId: generateMessageId(), serverity: 'error' });
        }
    }, [json, http, query, options, router]);

    const onExampleClick = useCallback((json: string, query: string) => {
        setJson(json);
        setQuery(query);
    }, []);

    const onCopyClick = useCallback(() => {
        navigator.clipboard.writeText(`jq ${options.join(' ')} '${query}'`)
            .then(() => setNotification({ message: 'Copied command', messageId: generateMessageId(), serverity: 'success' }))
            .catch(error => setNotification({ message: error.message, messageId: generateMessageId(), serverity: 'error' }));
    }, [query, options]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
            <Header onShare={handleShare} onExampleClick={onExampleClick} onCopyClick={onCopyClick} enableCopyButton={!!query.length} />
            <Container sx={{ flexGrow: 1, py: 2, display: 'flex', flexDirection: 'column', minWidth: minPlaygroundWidth }}>
                <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                    <Grid item xs={12} md={12} sx={{ display: 'flex', flexDirection: 'column', minHeight: minQueryEditorHeight }}>
                        <QueryEditor value={query} handleChange={handleQueryEditorChange} />
                    </Grid>
                </Grid>
                <Box>
                    <OptionsSelector options={options} setOptions={handleOptionsSelectorChange} />
                </Box>
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', minHeight: minEditorHeight }}>
                        <JSONEditor json={json} http={http} handleJSONChange={handleJSONEditorChange} handleHTTPChange={handleHttp} />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', minHeight: minEditorHeight }}>
                        <OutputEditor result={result} />
                    </Grid>
                </Grid>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        jqplay is open-source and licensed under the MIT license. View the&nbsp;
                        <Link href="https://github.com/owenthereal/jqplay" style={{ textDecoration: 'none', color: 'inherit' }}>
                            source code
                        </Link>
                        &nbsp;on GitHub.
                    </Typography>
                </Box>
                <Notification message={notification?.message} messageId={notification?.messageId} serverity={notification?.serverity} />
            </Container>
        </Box>
    );
}
