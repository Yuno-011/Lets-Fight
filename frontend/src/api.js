const GQL_URL = 'http://localhost:4000/graphql'

export async function gqlFetch(query, variables = {}) {
  const token = localStorage.getItem('token') ?? ''

  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify({ query, variables })
  })

  const { data, errors } = await res.json()
  if (errors) throw new Error(errors[0].message)
  return data
}