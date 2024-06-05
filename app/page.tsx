'use client'

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const jqFlagsOptions = [
  { value: '-c', label: '-c (Compact output)' },
  { value: '-M', label: '-M (Monochrome output)' },
  { value: '-r', label: '-r (Raw output)' },
  { value: '-s', label: '-s (Slurp: read into array)' },
  { value: '-S', label: '-S (Sort keys)' },
  { value: '-R', label: '-R (Raw input)' },
];

export default function Home() {
  const [result, setResult] = useState<string>('');

  const jsonRef = useRef<string>('');
  const queryRef = useRef<string>('');
  const flagsRef = useRef<string[]>([]);

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

  const handleJQRun = (json: string, query: string, flags: string[]) => {
    clearRunTimeout();

    if (json === '' || query === '') {
      setResult('');
      return
    }

    setResult('Running...');
    runTimeoutRef.current = setTimeout(() => {
      runJQ(json, query, flags, 5000)
        .then((result) => {
          setResult(result);
        })
        .catch((error) => {
          setResult(error.message);
        });
    }, 500);
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

        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }

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
      handleJQRun(jsonRef.current, queryRef.current, flagsRef.current);
    }
  };

  const handleJSONEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      jsonRef.current = value;
      handleJQRun(jsonRef.current, queryRef.current, flagsRef.current);
    }
  };

  const handleFlagsChange = (selectedOptions: any) => {
    console.log(selectedOptions)
    flagsRef.current = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    console.log(flagsRef.current)
    handleJQRun(jsonRef.current, queryRef.current, flagsRef.current);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">jqplay</h1>
      <div className="flex flex-col md:flex-row md:space-x-6 w-full max-w-7xl">
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          <h2 className="text-xl font-semibold mb-2">JSON</h2>
          <Editor height="40vh" width="100%" defaultLanguage="json" onChange={handleJSONEditorChange} />
        </div>
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          <h2 className="text-xl font-semibold mb-2">Filter</h2>
          <Editor height="40vh" width="100%" defaultLanguage="plaintext" onChange={handleQueryEditorChange} />
        </div>
      </div>
      <div className="w-full max-w-7xl mb-6">
        <h2 className="text-xl font-semibold mb-2">Options</h2>
        <Select
          isMulti
          options={jqFlagsOptions}
          onChange={handleFlagsChange}
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder="Select jq flags"
        />
      </div>
      <div className="w-full max-w-7xl">
        <h2 className="text-xl font-semibold mb-2">Output</h2>
        <Editor height="40vh" width="100%" defaultLanguage="json" value={result} options={{ readOnly: true }} />
      </div>
    </div>
  );
}
