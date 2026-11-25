import { HttpErrorResponse } from '@angular/common/http';

export class ApiError extends Error {
  constructor(readonly messages: string[]) {
    super(messages.join('\n'));
    this.name = 'ApiError';
  }
}

export function parseApiErrors(error: unknown): string[] {
  if (error instanceof ApiError) {
    return error.messages;
  }
  const payload = error instanceof HttpErrorResponse ? error.error : error;
  if (payload instanceof Blob) {
    return ['Не удалось обработать ответ сервера'];
  }
  if (typeof payload === 'string' && payload.trim()) {
    return [stripHtml(payload)];
  }
  if (!payload || typeof payload !== 'object') {
    if (error instanceof HttpErrorResponse) {
      return [error.statusText || `Ошибка ${error.status}`];
    }
    return ['Неизвестная ошибка'];
  }
  const body = payload as Record<string, unknown>;
  if ('Errors' in body) {
    return flattenErrors(body['Errors']);
  }
  if ('detail' in body) {
    return flattenErrors(body['detail']);
  }
  if ('status' in body && typeof body['status'] === 'string') {
    return [body['status']];
  }
  const fieldErrors = flattenErrors(body);
  return fieldErrors.length ? fieldErrors : ['Неизвестная ошибка'];
}

export function flattenErrors(value: unknown, prefix = ''): string[] {
  if (value == null || value === false) {
    return [];
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return [prefix ? `${prefix}: ${value}` : String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenErrors(item, prefix));
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
      flattenErrors(item, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

function stripHtml(value: string): string {
  if (!value.includes('<')) {
    return value;
  }
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || 'Ошибка сервера';
}
