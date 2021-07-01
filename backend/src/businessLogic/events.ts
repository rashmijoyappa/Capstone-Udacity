import * as uuid from 'uuid'

import { eventItem } from '../models/eventItem'
import { eventAcces} from '../dataLayer/eventAcces'
import { CreateeventRequest } from '../requests/CreateeventRequest'
import { UpdateeventRequest } from '../requests/UpdateeventRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'

const logger = createLogger('events')

const eventAccess = new eventAcces()

export const getAllevents = async (jwtToken: string): Promise<eventItem[]> => {
  const userId = parseUserId(jwtToken)

  return await eventAccess.getAllevents(userId)
}

export const createevent = async (
  createeventRequest: CreateeventRequest,
  jwtToken: string
): Promise<eventItem> => {
  logger.info('In createevent() function')

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await eventAccess.createevent({
    eventId: itemId,
    userId,
    name: createeventRequest.name,
    dueDate: createeventRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString()
  })
}

export const updateevent = async (
  eventId: string,
  updateeventRequest: UpdateeventRequest,
  jwtToken: string
): Promise<eventItem> => {
  logger.info('In updateevent() function')

  const userId = parseUserId(jwtToken)
  logger.info('User Id: ' + userId)

  return await eventAccess.updateevent({
    eventId,
    userId,
    name: updateeventRequest.name,
    dueDate: updateeventRequest.dueDate,
    done: updateeventRequest.done,
    createdAt: new Date().toISOString()
  })
}

export const deleteevent = async (
  eventId: string,
  jwtToken: string
): Promise<string> => {
  logger.info('In deleteevent() function')

  const userId = parseUserId(jwtToken)
  logger.info('User Id: ' + userId)

  return await eventAccess.deleteevent(eventId, userId)
}

export const generateUploadUrl = async (eventId: string): Promise<string> => {
  logger.info('In generateUploadUrl() function')

  return await eventAccess.generateUploadUrl(eventId)
}
