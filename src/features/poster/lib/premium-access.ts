/**
 * Gate for the premium (watermark-free, 3000px) download.
 *
 * Payment is not wired yet: this resolves `true` so the premium file can be
 * exercised end to end. When Zarinpal is added, replace the body with the real
 * flow (create the payment, send the user to the gateway, verify on return) and
 * resolve `true` only once the payment is verified — nothing else needs to
 * change, every premium download already goes through here.
 */
export async function ensurePremiumAccess(): Promise<boolean> {
  return true;
}
