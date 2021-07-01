import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Form,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import {
  createevent,
  deleteevent,
  getEvents,
  patchevent,
  checkAttachmentURL
} from '../api/Events-api'
import Auth from '../auth/Auth'
import { event } from '../types/event'
import Typist from 'react-typist'

interface EventsProps {
  auth: Auth
  history: History
}

interface EventsState {
  Events: event[]
  neweventName: string
  loadingEvents: boolean
}

export class Events extends React.PureComponent<EventsProps, EventsState> {
  state: EventsState = {
    Events: [],
    neweventName: '',
    loadingEvents: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ neweventName: event.target.value })
  }

  onEditButtonClick = (eventId: string) => {
    this.props.history.push(`/Events/${eventId}/edit`)
  }

  oneventCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newevent = await createevent(this.props.auth.getIdToken(), {
        name: this.state.neweventName,
        dueDate
      })
      this.setState({
        Events: [...this.state.Events, newevent],
        neweventName: ''
      })
    } catch {
      alert('event creation failed')
    }
  }

  oneventDelete = async (eventId: string) => {
    try {
      await deleteevent(this.props.auth.getIdToken(), eventId)
      this.setState({
        Events: this.state.Events.filter((event) => event.eventId != eventId)
      })
    } catch {
      alert('event deletion failed')
    }
  }

  oneventCheck = async (pos: number) => {
    try {
      const event = this.state.Events[pos]
      await patchevent(this.props.auth.getIdToken(), event.eventId, {
        name: event.name,
        dueDate: event.dueDate,
        done: !event.done
      })
      this.setState({
        Events: update(this.state.Events, {
          [pos]: { done: { $set: !event.done } }
        })
      })
    } catch {
      alert('event update failed')
    }
  }

  onCheckAttachmentURL = async (
    event: event,
    pos: number
  ): Promise<boolean> => {
    try {
      const response = event.attachmentUrl
        ? await checkAttachmentURL(event.attachmentUrl)
        : false

      this.setState({
        Events: update(this.state.Events, {
          [pos]: { validUrl: { $set: response } }
        })
      })

      return true
    } catch {
      return false
    }
  }

  async componentDidMount() {
    try {
      const Events = await getEvents(this.props.auth.getIdToken())

      this.setState({
        Events,
        loadingEvents: false
      })

      this.state.Events.map(async (event, pos) => {
        event['validUrl'] = event.attachmentUrl
          ? await this.onCheckAttachmentURL(event, pos)
          : false

        return event
      })
    } catch (e) {
      alert(`Failed to fetch Events: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Typist>
          <Header as="h1">Event list!</Header>
        </Typist>
        {this.renderCreateeventInput()}

        {this.renderEvents()}
      </div>
    )
  }

  renderCreateeventInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Event',
              onClick: this.oneventCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Events.."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderEvents() {
    if (this.state.loadingEvents) {
      return this.renderLoading()
    }

    return this.renderEventsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading event list...
        </Loader>
      </Grid.Row>
    )
  }

  renderEventsList() {
    return (
      <Grid padded>
        {this.state.Events.map((event, pos) => {
          return (
            <Grid.Row key={event.eventId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.oneventCheck(pos)}
                  checked={event.done}
                />
              </Grid.Column>

              <Grid.Column width={10} verticalAlign="middle">
                {event.name}
              </Grid.Column>

              <Grid.Column width={3} floated="right">
                {event.dueDate}
              </Grid.Column>

              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(event.eventId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>

              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.oneventDelete(event.eventId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>

              {event.attachmentUrl && event.validUrl ? (
                <Image
                  src={event.attachmentUrl}
                  size="small"
                  wrapped
                  centered
                />
              ) : null}

              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate())
    return dateFormat(date, 'yyyy-mm-dd hh:mm:ss') as string
  }
}
