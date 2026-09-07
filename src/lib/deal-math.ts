export interface DealAnalysis {
  maxOffer: number;
  contractPrice: number;
  buyerAllIn: number;
}

/**
 * 70% rule: a wholesaler's max offer to the seller leaves room for repairs,
 * their assignment fee, and the end buyer's margin at 70% of ARV.
 */
export function analyzeDeal(
  arv: number | null,
  repairEstimate: number | null,
  wholesaleFee: number | null,
): DealAnalysis | null {
  if (arv === null) return null;

  const repairs = repairEstimate ?? 0;
  const fee = wholesaleFee ?? 0;

  const maxOffer = arv * 0.7 - repairs - fee;
  const contractPrice = maxOffer + fee;
  const buyerAllIn = contractPrice + repairs;

  return { maxOffer, contractPrice, buyerAllIn };
}

/**
 * Loose talking points for the call, not a word-for-word script — phrased
 * like natural speech so a beginner doesn't read it to the seller verbatim.
 */
export function buildOfferScript(
  address: string,
  contactName: string,
  formattedOfferAmount: string,
  isViable: boolean,
): string {
  const name = contactName.trim() || "there";
  const property = address.trim() || "the property";

  if (!isViable) {
    return `Hey ${name}, really appreciate you walking me through ${property}. I crunched the numbers, and with the repairs it needs, I just can't make a cash offer work on this one right now. If anything changes down the road, I'd love to hear from you.`;
  }

  return `Hey ${name}, so I went over the numbers on ${property}. Honestly, the most I can do is around ${formattedOfferAmount} cash. I can close fast and cover the closing costs, so you wouldn't have to fix anything up or deal with an agent. What do you think?`;
}

/**
 * A short marketing blurb to send the buyers list once a deal is locked up.
 */
export function buildBuyerBlast(
  address: string,
  formattedContractPrice: string,
  formattedArv: string,
  formattedRepairs: string,
): string {
  const property = address.trim() || "a property";

  return `🏠 Wholesale deal available — ${property}\nAssignable contract price: ${formattedContractPrice}\nARV: ${formattedArv} | Est. repairs: ${formattedRepairs}\nCash buyers only — reply or call if you want the info packet.`;
}
