import { Publisher, Subjects, TicketUpdatedEvent } from "@skctickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
