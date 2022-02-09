export async function http(props: { url: string; method: string; body?: {}; headers?: any }): Promise<any> {
  const { url, method, body, headers } = props
  const jwt = localStorage.getItem('jwt')

  const defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwt}`,
    ...headers,
  }

  const res = await fetch(url, {
    method,
    headers: defaultHeaders,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const json = await res.json()
    console.log(json)
    return { status: res.status, ok: res.ok, statusText: res.statusText, ...json }
  }

  return res.json()
}
