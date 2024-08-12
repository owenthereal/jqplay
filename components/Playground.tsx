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
import { JQWorker, JsonInput } from '@/workers';
import { useRouter } from 'next/navigation';
import { HttpInput } from '@/workers/worker';

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
    json?: string;
    query?: string;
    options?: string[];
}

export function Playground(props: PlaygroundProps) {
    return (
        <ThemeProvider>
            <PlaygroundElement json={props.json} query={props.query} options={props.options} />
        </ThemeProvider>
    );
}

function PlaygroundElement(props: PlaygroundProps) {
    const router = useRouter();
    const [result, setResult] = useState<string>('');

    const [input, setInput] = useState<JsonInput | undefined>(undefined);
    const [query, setQuery] = useState<string>('');
    const [options, setOptions] = useState<string[]>([]);

    const [initialJson, setInitialJson] = useState<string | undefined>(props.json);
    const [initialQuery, setInitialQuery] = useState<string | undefined>(props.query);

    const [minPlaygroundWidth, setMinPlaygroundWidth] = useState<string>("");
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
        if (runIdRef.current) {
            runIdRef.current = null;
        }
    }, []);

    const updateMinHeight = () => {
        const height = window.innerHeight - 64 - 110 - 21; // 64px for header, 110 for options, 21 for footer
        const editorHeight = height * 2 / 3;
        const queryEditorHeight = height / 3;
        const minHeight = 35 * 4;
        setMinEditorHeight(Math.max(editorHeight, minHeight));
        setQueryMinEditorHeight(Math.max(queryEditorHeight, minHeight));

        const width = window.innerWidth;
        let playgroundWidth = '100%';
        if (width >= 1280) {
            playgroundWidth = '1280px'
        }
        setMinPlaygroundWidth(playgroundWidth);
    };

    useEffect(() => {
        updateMinHeight();
        window.addEventListener('resize', updateMinHeight);

        return () => {
            window.removeEventListener('resize', updateMinHeight);
            clearRunTimeout();
            terminateWorker();
        };
    }, [clearRunTimeout, terminateWorker]);

    // initial values
    useEffect(() => {
        setInput(initialJson || '');
        setQuery(initialQuery || '');
        setOptions(props.options || []);
    }, [initialJson, initialQuery, props.options]);

    const runJQ = useCallback((runId: number, input: JsonInput, query: string, options: string[], timeout: number): Promise<RunResult> => {
        terminateWorker();

        return new Promise<RunResult>((resolve, reject) => {
            const worker = new JQWorker(timeout);
            workerRef.current = worker;

            worker.run(input, query, options)
                .then((result) => {
                    resolve(new RunResult(runId, result));
                })
                .catch((error: any) => {
                    reject(new RunError(runId, error.message));
                });
        });
    }, [terminateWorker]);

    const handleJQRun = useCallback((input: JsonInput | undefined, query: string, options: string[]) => {
        clearRunTimeout();
        setResult('');

        if (!input || query === '') {
            return;
        }

        setResult('Running...');

        const runId = currentUnixTimestamp();
        runIdRef.current = runId;

        runTimeoutRef.current = setTimeout(() => {
            runJQ(runId, input, query, options, runTimeout)
                .then((result) => {
                    if (runIdRef.current === result.runId) {
                        setResult(result.result);
                    }
                })
                .catch((error: RunError) => {
                    if (runIdRef.current === error.runId) {
                        setResult(`Error: ${error.message}`);
                    }
                });
        }, 500);
    }, [clearRunTimeout, runJQ]);

    useEffect(() => {
        handleJQRun(input, query, options);
    }, [input, query, options, handleJQRun]);

    const handleJSONEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setInput(normalizeLineBreaks(value));
        }
    };

    const handleQueryEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setQuery(normalizeLineBreaks(value));
        }
    };

    const handleOptionsSelectorChange = (options: string[]) => {
        setOptions(options);
    };

    const handleHttp = async (method: string, url: string, headers?: string, body?: string) => {
        if (method.length === 0 || url.length === 0) {
            setInput(undefined);
            return
        }
        setInput(new HttpInput(method, url, headers, body));
    };

    const handleShare = async () => {
        if (input === null || query === '') {
            setNotification({ message: 'JSON and Query cannot be empty.', messageId: generateMessageId(), serverity: 'error' });
            return;
        }

        try {
            let json: string | undefined = undefined;
            let http: HttpInput | undefined = undefined;
            if (typeof input === 'string') {
                json = input
            } else {
                http = input
            }

            const response = await fetch('/api/snippets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    json,
                    query,
                    options,
                    http,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.errors ? data.errors.join(', ') : response.statusText);
            }

            // Redirect to the new snippet URL
            router.push(`/s/${data.slug}`);
        } catch (error: any) {
            setNotification({ message: error.message, messageId: generateMessageId(), serverity: 'error' });
        }
    };

    const onExampleClick = (json: string, query: string) => {
        setInitialJson(json);
        setInitialQuery(query);
    };

    const onCopyClick = () => {
        navigator.clipboard.writeText(`jq ${options.join(' ')} '${query}'`).then(() => {
            setNotification({ message: 'Copied command', messageId: generateMessageId(), serverity: 'success' });
        }).catch((e: any) => {
            setNotification({ message: e.message, messageId: generateMessageId(), serverity: 'error' });
        });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
            <Header onShare={handleShare} onExampleClick={onExampleClick} onCopyClick={onCopyClick} enableCopyButton={query.length > 0} />
            <Container sx={{ flexGrow: 1, py: 2, display: 'flex', flexDirection: 'column', minWidth: minPlaygroundWidth }}>
                <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                    <Grid item xs={12} md={12} sx={{ display: 'flex', flexDirection: 'column', minHeight: minQueryEditorHeight }}>
                        <QueryEditor value={initialQuery} handleChange={handleQueryEditorChange} />
                    </Grid>
                </Grid>
                <Box>
                    <OptionsSelector options={options} setOptions={handleOptionsSelectorChange} />
                </Box>
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', minHeight: minEditorHeight }}>
                        <JSONEditor input={input} minHeight={minEditorHeight} handleJSONChange={handleJSONEditorChange} handleHTTPChange={handleHttp} />
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
