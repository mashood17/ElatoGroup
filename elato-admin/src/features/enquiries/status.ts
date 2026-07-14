import type { BadgeTone } from "../../components/ui";
import type { EnquiryStatus } from "../../types/api";

export const STATUS_TONE: Record<EnquiryStatus, BadgeTone> = {
  new: "accent",
  contacted: "info",
  closed: "neutral",
};

export const STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

export const ENQUIRY_STATUSES: EnquiryStatus[] = ["new", "contacted", "closed"];
