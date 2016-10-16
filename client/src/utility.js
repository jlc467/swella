export const checkStatus = response => {
  if (response.ok) {
    return Promise.resolve(response)
  }
  // handle errors
  const contentType = response.headers.get("content-type")
  const message = `Fetch Error: ${response.statusText}`
  if(contentType && contentType.indexOf("application/json") !== -1) {
    return response.json().then(json => {
      return Promise.reject(
        Object.assign(
          json || { message },
          { response }
        )
      )
    })
  }
  return Promise.reject(
    Object.assign(
      { message },
      { response }
    )
  )
}

export const parseJSON = response => {
  return response.json()
}

export const buildJSONRequest = (method, body) => {
  return {
    method,
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}