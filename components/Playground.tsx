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
import { JQWorker } from '@/workers';
import { useRouter } from 'next/navigation';

const runTimeout = 30000;

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
    const [json, setJson] = useState<string>('');
    const [query, setQuery] = useState<string>('');
    const [options, setOptions] = useState<string[]>([]);
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
        const freeHeight = window.innerHeight - 64 - 110 - 21; // 64px for header, 110 for options, 21 for footer
        const editorHeight = freeHeight * 2 / 3;
        const queryEditorHeight = freeHeight / 3;
        const minHeight = 35;

        setMinEditorHeight(Math.max(editorHeight, minHeight));
        setQueryMinEditorHeight(Math.max(queryEditorHeight, minHeight));
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
        setJson(props.json || '');
        setQuery(props.query || '');
        setOptions(props.options || []);
    }, [props.json, props.query, props.options]);

    const runJQ = useCallback((runId: number, json: string, query: string, options: string[], timeout: number): Promise<RunResult> => {
        terminateWorker();

        return new Promise<RunResult>((resolve, reject) => {
            const worker = new JQWorker(timeout);
            workerRef.current = worker;

            worker.jq(normalizeLineBreaks(json), normalizeLineBreaks(query), options)
                .then((result) => {
                    resolve(new RunResult(runId, result));
                })
                .catch((error: any) => {
                    reject(new RunError(runId, error.message));
                });
        });
    }, [terminateWorker]);

    const handleJQRun = useCallback((json: string, query: string, options: string[]) => {
        clearRunTimeout();
        setResult('');

        if (json === '' || query === '') {
            return;
        }

        setResult('Running...');

        const runId = currentUnixTimestamp();
        runIdRef.current = runId;

        runTimeoutRef.current = setTimeout(() => {
            runJQ(runId, json, query, options, runTimeout)
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
        handleJQRun(json, query, options);
    }, [json, query, options, handleJQRun]);

    const handleJSONEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setJson(value);
        }
    };

    const handleQueryEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setQuery(value);
        }
    };

    const handleOptionsSelectorChange = (options: string[]) => {
        setOptions(options);
    };

    const handleShare = async () => {
        if (json === '' || query === '') {
            setNotification({ message: 'JSON and Query cannot be empty.', messageId: generateMessageId(), serverity: 'error' });
            return;
        }

        try {
            const response = await fetch('/api/snippets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    json,
                    query,
                    options,
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
        setJson(json);
        setQuery(query);
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
            <Container sx={{ flexGrow: 1, py: 2, display: 'flex', flexDirection: 'column', minWidth: '100%' }}>
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
                        <JSONEditor value={json} handleChange={handleJSONEditorChange} />
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
