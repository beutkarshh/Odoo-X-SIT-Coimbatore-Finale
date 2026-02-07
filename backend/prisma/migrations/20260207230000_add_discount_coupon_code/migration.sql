-- Add couponCode to Discount
ALTER TABLE "Discount" ADD COLUMN "couponCode" TEXT;

-- Unique constraint for coupon codes (allows multiple NULLs in Postgres)
CREATE UNIQUE INDEX "Discount_couponCode_key" ON "Discount"("couponCode");

-- Index to speed lookups
CREATE INDEX "Discount_couponCode_idx" ON "Discount"("couponCode");
