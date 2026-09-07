import type { LeadStatus } from "@/types/lead";

export const PAPERWORK_CHECKLIST: Record<LeadStatus, string[]> = {
  new: [
    "Confirm the address and that you're talking to someone on the title (the actual owner)",
  ],
  contacted: [
    "Get verbal agreement on a price before sending any paperwork",
    "Ask about liens, mortgage balance, and any title issues",
  ],
  under_contract: [
    "Get the purchase agreement signed by everyone on title",
    "Add an assignment clause so you're allowed to sell the contract",
    "Open escrow with a title company that allows assignments",
  ],
  assigned: [
    "Sign an Assignment of Contract with your end buyer",
    "Collect your assignment fee deposit or earnest money",
    "Notify the title company who the new buyer is",
  ],
  closed: [
    "Confirm your assignment fee was paid at closing",
    "Save the closing statement for your records/taxes",
  ],
  dead: ["Jot down why it didn't work — helps you spot patterns later"],
};
