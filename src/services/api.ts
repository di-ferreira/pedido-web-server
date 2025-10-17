const BASE_URL = process.env.EMSOFT_API;

type ResponseData<K> = {
  status: number;
  statusText: string;
  body: K | null;
};

// Configuração padrão de retry
const DEFAULT_RETRY_OPTIONS = {
  retries: 3,
  delay: 1000, // 1s inicial
  timeout: 10000, // 10s por tentativa
};

export async function CustomFetch<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
  retryOptions: typeof DEFAULT_RETRY_OPTIONS = DEFAULT_RETRY_OPTIONS
): Promise<ResponseData<T>> {
  const { retries, delay, timeout } = retryOptions;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${BASE_URL}${input}`, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const hasBody = response.headers.get('content-length') !== '0';
      const isJson = response.headers
        .get('content-type')
        ?.includes('application/json');

      let result: T | null = null;

      if (hasBody && isJson) {
        try {
          result = await response.json();
        } catch (e) {
          // Se falhar ao parsear JSON, retorna body null (comportamento original)
          result = null;
        }
      }

      // ✅ Sucesso: retorna normalmente
      if (response.ok) {
        return {
          status: response.status,
          statusText: response.statusText,
          body: result,
        };
      }

      // ❌ Erros que merecem retry: 5xx, 429 (rate limit), 408 (timeout)
      const shouldRetry = [500, 502, 503, 504, 429, 408].includes(
        response.status
      );

      if (shouldRetry && attempt < retries) {
        // Loga tentativa falha (opcional, remova em produção se quiser silencioso)
        console.warn(
          `[CustomFetch] Tentativa ${attempt} falhou: ${response.status} ${
            response.statusText
          }. Nova tentativa em ${delay * Math.pow(2, attempt - 1)}ms...`
        );

        // Espera antes da próxima tentativa (backoff exponencial)
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt - 1))
        );

        continue; // volta ao loop para tentar novamente
      }

      // Se não for para retry ou for a última tentativa, retorna o erro
      return {
        status: response.status,
        statusText: response.statusText,
        body: result,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      lastError = error;

      // Se for erro de rede, timeout ou abort, tenta novamente (se não for a última tentativa)
      const isNetworkError =
        error instanceof Error &&
        (error.name === 'AbortError' ||
          error.message.includes('fetch') ||
          error.message.includes('network'));

      if (isNetworkError && attempt < retries) {
        console.warn(
          `[CustomFetch] Tentativa ${attempt} falhou por erro de rede: ${error}. Nova tentativa em ${
            delay * Math.pow(2, attempt - 1)
          }ms...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt - 1))
        );

        continue;
      }

      // Se for erro de rede na última tentativa, ou erro não tratado, retorna como erro
      return {
        status: 0, // Status 0 = erro de rede (não HTTP)
        statusText: error instanceof Error ? error.message : 'Unknown error',
        body: null,
      };
    }
  }

  // Isso nunca deve ser alcançado, mas por segurança:
  return {
    status: 0,
    statusText: 'Max retries exceeded',
    body: null,
  };
}

