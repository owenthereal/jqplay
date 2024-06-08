import { useState, useRef, useEffect } from 'react';
import { Box, Container, Grid } from '@mui/material';
import Header from './Header';
import JSONEditor from './JSONEditor';
import QueryEditor from './QueryEditor';
import OptionsSelector from './OptionsSelector';
import OutputEditor from './OutputEditor';
import { ThemeProvider } from './ThemeProvider';

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

export default function PlaygroundLayout(props: PlaygroundProps) {
    return (
        <ThemeProvider>
            <Playground InitialJson={props.InitialJson} InitialQuery={props.InitialQuery} InitialOptions={props.InitialOptions} />
        </ThemeProvider>
    );
}

interface PlaygroundProps {
    InitialJson?: string;
    InitialQuery?: string;
    InitialOptions?: string[];
}

function Playground(props: PlaygroundProps) {
    const [result, setResult] = useState<string>('');
    const [json, setJson] = useState<string>('');
    const [query, setQuery] = useState<string>('');
    const [options, setOptions] = useState<string[]>([]);
    const [minEditorHeight, setMinEditorHeight] = useState<number>(0);

    const workerRef = useRef<Worker | null>(null);
    const runIdRef = useRef<number | null>(null);
    const runTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const terminateWorker = () => {
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }
    };

    const clearRunTimeout = () => {
        if (runTimeoutRef.current) {
            clearTimeout(runTimeoutRef.current);
            runTimeoutRef.current = null;
        }
        if (runIdRef.current) {
            runIdRef.current = null;
        }
    };

    const updateMinHeight = () => {
        const calculatedHeight = (window.innerHeight - 64 - 64 * 2) / 2;
        const minHeight = 35;
        setMinEditorHeight(Math.max(calculatedHeight, minHeight));
    };

    useEffect(() => {
        updateMinHeight();
        window.addEventListener('resize', updateMinHeight);

        return () => {
            window.removeEventListener('resize', updateMinHeight);
            clearRunTimeout();
            terminateWorker();
        };
    }, []);

    // initial values
    useEffect(() => {
        setJson(props.InitialJson || '');
        setQuery(props.InitialQuery || '');
        setOptions(props.InitialOptions || []);
    }, [props.InitialJson, props.InitialQuery, props.InitialOptions]);

    useEffect(() => {
        handleJQRun(json, query, options);
    }, [json, query, options]);


    const handleJQRun = (json: string, query: string, options: string[]) => {
        clearRunTimeout();
        terminateWorker();
        setResult('');

        if (json === '' || query === '') {
            return;
        }

        setResult('Running...');

        const runId = Math.floor(new Date().getTime() / 1000);
        runIdRef.current = runId

        runTimeoutRef.current = setTimeout(() => {
            runJQ(runId, json, query, options, 30000)
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
    };

    const runJQ = (runId: number, json: string, query: string, options: string[], timeout: number): Promise<RunResult> => {
        terminateWorker();

        return new Promise<RunResult>((resolve, reject) => {
            const worker = new Worker(new URL('../workers/worker.ts', import.meta.url));
            workerRef.current = worker;

            const timeoutId = setTimeout(() => {
                worker.terminate();
                workerRef.current = null;
                reject(new RunError(runId, 'jq timed out'));
            }, timeout);

            worker.onmessage = function (event) {
                clearTimeout(timeoutId);

                if (event.data.error) {
                    reject(new RunError(runId, event.data.error));
                } else {
                    resolve(new RunResult(runId, event.data.result));
                }

                worker.terminate();
                workerRef.current = null;
            };

            worker.onerror = function (error) {
                clearTimeout(timeoutId);
                reject(new RunError(runId, `Worker error: ${error.message}`));
                worker.terminate();
                workerRef.current = null;
            };

            worker.postMessage({ json, query, options });
        });
    };

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

            if (!response.ok) {
                throw new Error('Failed to save snippet');
            }

            const data = await response.json();
            const snippetUrl = `${window.location.origin}/s/${data.slug}`;

            // Redirect to the new snippet URL
            window.location.href = snippetUrl;
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
            <Header onShare={handleShare} />
            <Container sx={{ flexGrow: 1, py: 2, display: 'flex', flexDirection: 'column', minWidth: '100%' }}>
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', minHeight: minEditorHeight }}>
                        <JSONEditor value={json} handleChange={handleJSONEditorChange} />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', minHeight: minEditorHeight }}>
                        <QueryEditor value={query} handleChange={handleQueryEditorChange} />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                    <OptionsSelector options={options} setOptions={handleOptionsSelectorChange} />
                </Box>
                <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                    <Grid item xs={12} md={12} sx={{ display: 'flex', flexDirection: 'column', minHeight: minEditorHeight }}>
                        <OutputEditor result={result} />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
