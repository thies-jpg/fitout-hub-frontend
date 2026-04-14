import { apiGet, apiPost } from './client';

export async function uploadDevFsm(file) {
  const content = await file.text();
  return apiPost('/dev/fsm', { content });
}

export async function uploadDevProgram(file) {
  const content = await file.text();
  return apiPost('/dev/program', { content });
}

export async function runDevTestfit() {
  return apiPost('/dev/run', {});
}

export async function getDevStatus() {
  return apiGet('/dev/status');
}
