-- Add discount/coupon/tax tracking fields to Invoice
ALTER TABLE "Invoice"
  ADD COLUMN "couponCode" TEXT,
  ADD COLUMN "discountPercent" DECIMAL(5,2),
  ADD COLUMN "taxPercent" DECIMAL(5,2),
  ADD COLUMN "platformFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "discountId" INTEGER;

-- Index + FK for discount relation
CREATE INDEX "Invoice_discountId_idx" ON "Invoice"("discountId");

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_discountId_fkey"
  FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
