import { useState, useRef, useEffect } from 'react';
import { Box, Container, Grid } from '@mui/material';
import Header from '../components/Header';
import JSONEditor from '../components/JSONEditor';
import QueryEditor from '../components/QueryEditor';
import OptionsSelector from '../components/OptionsSelector';
import OutputEditor from '../components/OutputEditor';

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

export default function Home({ darkMode, toggleDarkMode }: { darkMode: boolean, toggleDarkMode: () => void }) {
    const [result, setResult] = useState<string>('');
    const [options, setOptions] = useState<string[]>([]);
    const [minEditorHeight, setMinEditorHeight] = useState<number>(0);

    const jsonRef = useRef<string>('');
    const queryRef = useRef<string>('');
    const optionsRef = useRef<string[]>([]);

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

    useEffect(() => {
        const updateMinHeight = () => {
            let height = (window.innerHeight - 64 - 64 * 2) / 2;
            if (height < 35) {
                height = 35;
            }
            setMinEditorHeight(height);
        };

        updateMinHeight();
        window.addEventListener('resize', updateMinHeight);

        return () => {
            window.removeEventListener('resize', updateMinHeight);
        };
    }, []);

    useEffect(() => {
        return () => {
            clearRunTimeout();
            terminateWorker();
        };
    }, []);


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
            jsonRef.current = value;
            handleJQRun(jsonRef.current, queryRef.current, optionsRef.current);
        }
    };

    const handleQueryEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            queryRef.current = value;
            handleJQRun(jsonRef.current, queryRef.current, optionsRef.current);
        }
    };

    const handleOptionsSelectorChange = (options: string[]) => {
        setOptions(options);
        optionsRef.current = options;
        handleJQRun(jsonRef.current, queryRef.current, optionsRef.current);
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/?json=${encodeURIComponent(jsonRef.current)}&query=${encodeURIComponent(queryRef.current)}&options=${encodeURIComponent(optionsRef.current.join(','))}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Share link copied to clipboard');
        });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
            <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} onShare={handleShare} />
            <Container sx={{ flexGrow: 1, py: 2, display: 'flex', flexDirection: 'column', minWidth: '100%' }}>
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', minHeight: minEditorHeight }}>
                        <JSONEditor darkMode={darkMode} handleChange={handleJSONEditorChange} />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', minHeight: minEditorHeight }}>
                        <QueryEditor darkMode={darkMode} handleChange={handleQueryEditorChange} />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                    <OptionsSelector options={options} setOptions={handleOptionsSelectorChange} />
                </Box>
                <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                    <Grid item xs={12} md={12} sx={{ display: 'flex', flexDirection: 'column', minHeight: minEditorHeight }}>
                        <OutputEditor darkMode={darkMode} result={result} />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
