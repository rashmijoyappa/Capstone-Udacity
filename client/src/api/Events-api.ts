import { apiEndpoint, subDirectory, devapiEndpoint } from '../config'
import { event } from '../types/event'
import { CreateeventRequest } from '../types/CreateeventRequest'
import Axios from 'axios'
import { UpdateeventRequest } from '../types/UpdateeventRequest'

console.log('is offline:', process.env.REACT_APP_IS_OFFLINE)

let Endpoint: string
let JWTtoken: string

if (
  process.env.REACT_APP_IS_OFFLINE == 'false' ||
  process.env.REACT_APP_IS_OFFLINE == undefined
) {
  Endpoint = apiEndpoint
} else {
  console.log('offline')
  Endpoint = devapiEndpoint
}
console.log(Endpoint)

export async function getEvents(idToken: string): Promise<event[]> {
  console.log('Fetching events')
  if (
    process.env.REACT_APP_IS_OFFLINE == 'false' ||
    process.env.REACT_APP_IS_OFFLINE == undefined
  ) {
    JWTtoken = idToken
  } else {
    console.log('Offline')
    JWTtoken = '123'
  }
  console.log('My token id:', JWTtoken)
  console.log('get link: ', `${Endpoint}/${subDirectory}`)
  const response = await Axios.get(`${Endpoint}/${subDirectory}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JWTtoken}`
    }
  })
  console.log('Events:', response.data)
  console.log('token', JWTtoken)
  return response.data.items
}

export async function createevent(
  idToken: string,
  newevent: CreateeventRequest
): Promise<event> {
  if (
    process.env.REACT_APP_IS_OFFLINE == 'false' ||
    process.env.REACT_APP_IS_OFFLINE == undefined
  ) {
    JWTtoken = idToken
  } else {
    console.log('Offline')
    JWTtoken = '123'
  }
  const response = await Axios.post(
    `${Endpoint}/${subDirectory}`,
    JSON.stringify(newevent),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWTtoken}`
      }
    }
  )
  console.log(response.data)

  return response.data.newItem
}

export async function patchevent(
  idToken: string,
  eventId: string,
  updatedevent: UpdateeventRequest
): Promise<void> {
  if (
    process.env.REACT_APP_IS_OFFLINE == 'false' ||
    process.env.REACT_APP_IS_OFFLINE == undefined
  ) {
    JWTtoken = idToken
  } else {
    console.log('Offline')
    JWTtoken = '123'
  }
  await Axios.patch(
    `${Endpoint}/${subDirectory}/${eventId}`,
    JSON.stringify(updatedevent),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWTtoken}`
      }
    }
  )
}

export async function deleteevent(
  idToken: string,
  eventId: string
): Promise<void> {
  if (
    process.env.REACT_APP_IS_OFFLINE == 'false' ||
    process.env.REACT_APP_IS_OFFLINE == undefined
  ) {
    JWTtoken = idToken
  } else {
    console.log('Offline')
    JWTtoken = '123'
  }
  console.log('Deletion endpoint', `${Endpoint}/${subDirectory}/${eventId}`)
  await Axios.delete(`${Endpoint}/${subDirectory}/${eventId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${JWTtoken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  eventId: string
): Promise<string> {
  if (
    process.env.REACT_APP_IS_OFFLINE == 'false' ||
    process.env.REACT_APP_IS_OFFLINE == undefined
  ) {
    JWTtoken = idToken
  } else {
    console.log('Offline')
    JWTtoken = '123'
  }
  const response = await Axios.post(
    `${Endpoint}/${subDirectory}/${eventId}/attachment`,
    '',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWTtoken}`
      }
    }
  )
  console.log(response.data)

  return response.data.uploadUrl
}

export async function uploadFile(
  uploadUrl: string,
  file: Buffer
): Promise<void> {
  await Axios.put(uploadUrl, file)
}

export const checkAttachmentURL = async (
  attachmentUrl: string
): Promise<boolean> => {
  await Axios.get(attachmentUrl)

  return true
}
