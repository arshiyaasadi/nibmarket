import { loadTestConfig, type ApiTestConfig } from "./config";

export class ApiTestClient {
  private token: string | null = null;

  constructor(private readonly config: ApiTestConfig) {
    this.token = config.accessToken ?? null;
  }

  get baseUrl(): string {
    return this.config.baseUrl;
  }

  async login(): Promise<string> {
    if (this.token) return this.token;

    const res = await fetch(`${this.config.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile: this.config.mobile,
        password: this.config.password,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Login failed (${res.status}): ${body}`);
    }

    const data = (await res.json()) as { token?: string };
    if (!data.token) {
      throw new Error("Login response missing token field");
    }

    this.token = data.token;
    return this.token;
  }

  async get(path: string, options: { auth?: boolean } = {}): Promise<Response> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (options.auth !== false) {
      headers.Authorization = `Bearer ${await this.login()}`;
    }

    return fetch(`${this.config.baseUrl}${path}`, { method: "GET", headers });
  }

  async getJson<T>(path: string, options: { auth?: boolean } = {}): Promise<T> {
    const res = await this.get(path, options);
    const body = await res.json();
    if (!res.ok) {
      throw new Error(`GET ${path} failed (${res.status}): ${JSON.stringify(body)}`);
    }
    return body as T;
  }

  /** Fetch directly from backend v2 (parity comparison). */
  async getBackendJson<T>(path: string): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${await this.login()}`,
    };

    const res = await fetch(`${this.config.backendBaseUrl}${path}`, {
      method: "GET",
      headers,
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(`Backend GET ${path} failed (${res.status}): ${JSON.stringify(body)}`);
    }
    return body as T;
  }
}

export function createTestClient(): ApiTestClient {
  return new ApiTestClient(loadTestConfig());
}
