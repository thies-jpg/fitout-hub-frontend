import DebugView from '../../components/dev/DebugView';
import { useEffect, useState } from 'react';
import {
  getDevStatus,
  runDevTestfit,
  uploadDevFsm,
  uploadDevProgram
} from '../../api/dev';

export default function DevPage() {
  const [status, setStatus] = useState({ fsmExists: false, programExists: false });
  const [result, setResult] = useState(null);
  const [debugData, setDebugData] = useState({
    netGeometry: [],
    zones: [],
    placements: [],
    circulation: []
  });
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function refreshStatus() {
    try {
      const res = await getDevStatus();
      setStatus({
        fsmExists: !!res.fsmExists,
        programExists: !!res.programExists
      });
    } catch (err) {
      setError(err?.message || 'Failed to load status');
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  async function handleFsmUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage('');
    setError('');

    try {
      await uploadDevFsm(file);
      setMessage('FSM uploaded');
      await refreshStatus();
    } catch (err) {
      setError(err?.message || 'FSM upload failed');
    } finally {
      event.target.value = '';
    }
  }

  async function handleProgramUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage('');
    setError('');

    try {
      await uploadDevProgram(file);
      setMessage('Program uploaded');
      await refreshStatus();
    } catch (err) {
      setError(err?.message || 'Program upload failed');
    } finally {
      event.target.value = '';
    }
  }

  async function handleRun() {
    setIsRunning(true);
    setMessage('');
    setError('');

    try {
      const res = await runDevTestfit();
      const runResult = res.result || null;

      setResult(runResult);

      setDebugData({
        netGeometry: runResult?.layout_model?.floor?.net_geometry || [],
        zones: res.debug?.zones || [],
        placements: runResult?.placements || [],
        circulation: runResult?.circulation?.reserved_polygons || []
      });

      setMessage('Testfit completed');
    } catch (err) {
      setError(err?.message || 'Run failed');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Dev</h1>

      <div style={{ marginBottom: 16 }}>
        <strong>Status</strong>
        <div>FSM: {status.fsmExists ? 'uploaded' : 'missing'}</div>
        <div>Program: {status.programExists ? 'uploaded' : 'missing'}</div>
      </div>

      <div style={{ display: 'grid', gap: 16, maxWidth: 520 }}>
        <div>
          <label>
            <strong>Upload FSM</strong>
          </label>
          <div>
            <input type="file" accept=".json,application/json" onChange={handleFsmUpload} />
          </div>
        </div>

        <div>
          <label>
            <strong>Upload Program</strong>
          </label>
          <div>
            <input type="file" accept=".json,application/json" onChange={handleProgramUpload} />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || !status.fsmExists || !status.programExists}
          >
            {isRunning ? 'Running...' : 'Run Testfit'}
          </button>
        </div>
      </div>

      {message ? (
        <div style={{ color: 'green', marginTop: 16 }}>{message}</div>
      ) : null}

      {error ? (
        <div style={{ color: 'crimson', marginTop: 16 }}>{error}</div>
      ) : null}

      <div style={{ marginTop: 24 }}>
        <strong>Result</strong>
        <pre
          style={{
            marginTop: 8,
            padding: 12,
            background: '#f6f6f6',
            border: '1px solid #ddd',
            borderRadius: 8,
            maxHeight: 500,
            overflow: 'auto'
          }}
        >
          {result ? JSON.stringify(result, null, 2) : 'No result yet'}
        </pre>
        <DebugView
          netGeometry={debugData.netGeometry}
          zones={debugData.zones}
          placements={debugData.placements}
          circulation={debugData.circulation}
        />
      </div>
    </div>
  );
}
