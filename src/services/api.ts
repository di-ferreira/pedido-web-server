import axios from 'axios';
const BASE_URL = process.env.EMSOFT_API;

type ResponseData<K> = {
  status: number;
  statusText: string;
  body: K;
};

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

export async function CustomFetch<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) {
  // let config;

  // if (init !== undefined) {
  //   config = {
  //     method: init.method,
  //     data: init.body,
  //     headers: {
  //       'Content-Type': init.headers
  //         ? init.headers['Content-Type']
  //         : 'application/json',
  //       Authorization: init.headers['Authorization'],
  //     },
  //   };
  // }

  // const data = await api(`${BASE_URL}${input}`, config);
  const data = await fetch(`${BASE_URL}${input}`, init);

  const result = await data.json();
  // const result = data;

  const responseData: ResponseData<T> = {
    status: data.status,
    statusText: data.statusText,
    body: result as T,
  };

  return responseData;
}

