'use client'

import { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import JSONEditor from '../components/JSONEditor';
import QueryEditor from '../components/QueryEditor';
import FlagsSelector from '../components/FlagsSelector';
import OutputEditor from '../components/OutputEditor';

export default function Home() {
  const [result, setResult] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [flags, setFlags] = useState<string[]>([]);

  const jsonRef = useRef<string>('');
  const queryRef = useRef<string>('');
  const flagsRef = useRef<string[]>([]);

  const workerRef = useRef<Worker | null>(null);
  const runTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const terminateWorker = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  };

  const clearRunTimeout = () => {
    if (runTimeoutIdRef.current) {
      clearTimeout(runTimeoutIdRef.current);
      runTimeoutIdRef.current = null;
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
      return;
    }

    setResult('Running...');
    runTimeoutIdRef.current = setTimeout(() => {
      runJQ(json, query, flags, 30000)
        .then((result) => {
          setResult(result);
        })
        .catch((error) => {
          setResult(`Error: ${error.message}`);
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

  const handleFlagsChange = (flags: string[]) => {
    setFlags(flags);
    flagsRef.current = flags;
    handleJQRun(jsonRef.current, queryRef.current, flagsRef.current);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/?json=${encodeURIComponent(jsonRef.current)}&query=${encodeURIComponent(queryRef.current)}&flags=${encodeURIComponent(flagsRef.current.join(','))}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard');
    });
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-900 text-gray-100 dark:bg-gray-900 dark:text-gray-100 bg-white text-black">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} onShare={handleShare} />
        <div className="flex flex-col md:flex-row md:space-x-6 w-full max-w-7xl">
          <JSONEditor darkMode={darkMode} handleChange={handleJSONEditorChange} />
          <QueryEditor darkMode={darkMode} handleChange={handleQueryEditorChange} />
        </div>
        <FlagsSelector darkMode={darkMode} flags={flags} setFlags={handleFlagsChange} />
        <OutputEditor darkMode={darkMode} result={result} />
      </div>
    </div >
  );
}
