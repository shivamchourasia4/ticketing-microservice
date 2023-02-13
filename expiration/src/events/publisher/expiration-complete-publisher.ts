import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@skctickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
