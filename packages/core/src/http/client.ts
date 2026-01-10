import * as https from 'node:https';
import { API_HOSTNAME, DEFAULT_HEADERS } from '../utils/constants.js';
import { ApiError } from '../errors/classes.js';
import type { ApiResponse } from '../types/api.js';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * HTTP client for Timo API requests
 */
export class HttpClient {
  private readonly hostname: string;

  constructor(hostname: string = API_HOSTNAME) {
    this.hostname = hostname;
  }

  /**
   * Make a POST request
   */
  async post<T = unknown>(
    path: string,
    body: object,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const data = JSON.stringify(body);
    const headers = {
      ...DEFAULT_HEADERS,
      'content-length': Buffer.byteLength(data).toString(),
      ...options.headers,
    };

    return this.request<T>('POST', path, headers, data, options.timeout);
  }

  /**
   * Make a GET request
   */
  async get<T = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    // Remove content-type for GET requests
    const { 'content-type': _contentType, ...getHeaders } = DEFAULT_HEADERS;
    const headers = {
      ...getHeaders,
      ...options.headers,
    };

    return this.request<T>('GET', path, headers, undefined, options.timeout);
  }

  private request<T>(
    method: string,
    path: string,
    headers: Record<string, string>,
    body?: string,
    timeout = 30000
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        hostname: this.hostname,
        port: 443,
        path,
        method,
        headers,
        timeout,
      };

      const req = https.request(requestOptions, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData) as ApiResponse<T>;
            resolve(parsed);
          } catch {
            reject(new ApiError('Failed to parse response', res.statusCode || 500, responseData));
          }
        });
      });

      req.on('error', (error) => {
        reject(new ApiError(`Request failed: ${error.message}`, 0));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new ApiError('Request timeout', 408));
      });

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }
}
