-- AlterTable
ALTER TABLE "RecurringPlan" ADD COLUMN     "productId" INTEGER;

-- CreateIndex
CREATE INDEX "RecurringPlan_productId_idx" ON "RecurringPlan"("productId");

-- AddForeignKey
ALTER TABLE "RecurringPlan" ADD CONSTRAINT "RecurringPlan_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
