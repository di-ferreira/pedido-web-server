const BASE_URL = process.env.EMSOFT_API;

type ResponseData<K> = {
  status: number;
  statusText: string;
  body: K;
};

export async function CustomFetch<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) {
  const data = await fetch(`${BASE_URL}${input}`, init);

  const hasBody = data.headers.get('content-length') !== '0';
  const isJson = data.headers.get('content-type')?.includes('application/json');

  let result: T | null = null;

  if (hasBody && isJson) {
    try {
      result = await data.json();
    } catch (e) {
      return {
        status: data.status,
        statusText: data.statusText,
        body: null,
      };
    }
  }

  return {
    status: data.status,
    statusText: data.statusText,
    body: result,
  };
}

