import type { CreateTicketInput, Ticket, TicketAttachment } from "../types";
import { createMockTicketService } from "./mockTicketService";

/**
 * The seam between the Help panel and EMS. Everything the UI does with a
 * ticket goes through this interface, so swapping the localStorage mock for
 * the EMS API is a one-line change in `ticketService` below.
 */
export interface TicketService {
  createTicket(input: CreateTicketInput): Promise<Ticket>;
  listMyTickets(): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | null>;
  postMessage(id: string, text: string, attachments?: File[]): Promise<Ticket>;
  addAttachment(id: string, file: File): Promise<TicketAttachment>;
  /** Re-sends the "waiting for EM" request after an escalation ("Keep waiting"). */
  keepWaiting(id: string): Promise<Ticket>;
  /**
   * Status/message changes for one ticket (or every ticket with "*").
   * EMS will push these over a socket; the mock polls its own clock.
   */
  subscribe(id: string | "*", onChange: (ticket: Ticket) => void): () => void;
  /** Dev-only: pretend an EM picked the ticket up. Undefined on the real API. */
  simulateAssign?(id: string): Promise<Ticket>;
}

export const ticketService: TicketService = createMockTicketService();
