import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T["subject"]; // Name of the channel this listener is going to listen to
  abstract queueGroupName: string; // Name of the queue group this listener will join
  abstract onMessage(data: T["data"], msg: Message): void; // Function to run when a message is recieved
  private client: Stan; // Pre initialized NATS client
  protected ackWait = 5 * 1000; // No. of seconds this listener has to ack a message

  constructor(client: Stan) {
    this.client = client;
  }

  // Default subscription Options
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  // code to setup the subscription
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on("message", (msg: Message) => {
      console.log(`Message Received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  // Helper function to parse a message
  parseMessage(msg: Message) {
    const data = msg.getData();

    return typeof data == "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}
