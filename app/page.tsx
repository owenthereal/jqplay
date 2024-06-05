'use client'

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export default function Home() {
  const [result, setResult] = useState<string>('');

  const jsonRef = useRef<string>('');
  const queryRef = useRef<string>('');

  const workerRef = useRef<Worker | null>(null);
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
  };

  useEffect(() => {
    return () => {
      clearRunTimeout();
      terminateWorker();
    };
  }, []);

  const handleJQRun = (json: string, query: string) => {
    if (json === '' || query === '') {
      setResult('');
      clearRunTimeout();
    } else {
      setResult('Running...');
      clearRunTimeout();
      runTimeoutRef.current = setTimeout(() => {
        runJQ(json, query, [], 5000)
          .then((result) => {
            setResult(result);
          })
          .catch((error) => {
            setResult(error.message);
          });
      }, 500);
    }
  };

  const runJQ = (json: string, query: string, flags: string[], timeout: number): Promise<string> => {
    terminateWorker();

    return new Promise<string>((resolve, reject) => {
      const worker = new Worker(new URL('../workers/worker.ts', import.meta.url));
      workerRef.current = worker;

      const timeoutId = setTimeout(() => {
        worker.terminate();
        workerRef.current = null;
        reject(new Error('jq timed out'));
      }, timeout);

      worker.onmessage = function (event) {
        clearTimeout(timeoutId);
        resolve(event.data.result);
        worker.terminate();
        workerRef.current = null;
      };

      worker.onerror = function (error) {
        clearTimeout(timeoutId);
        reject(new Error(`Worker error: ${error.message}`));
        worker.terminate();
        workerRef.current = null;
      };

      worker.postMessage({ json, query, flags });
    });
  };

  const handleQueryEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      queryRef.current = value;
      handleJQRun(jsonRef.current, queryRef.current);
    }
  };

  const handleJSONEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      jsonRef.current = value;
      handleJQRun(jsonRef.current, queryRef.current);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Editor height="20vh" width="100%" defaultLanguage="plaintext" onChange={handleQueryEditorChange} />
      <Editor height="50vh" width="100%" defaultLanguage="json" onChange={handleJSONEditorChange} />
      <Editor height="50vh" width="100%" defaultLanguage="json" value={result} options={{ readOnly: true }} />
    </main>
  );
}
