-- AlterTable
ALTER TABLE "MealTemplate" ADD COLUMN     "parentRecipeId" TEXT;

-- CreateIndex
CREATE INDEX "MealTemplate_userId_parentRecipeId_idx" ON "MealTemplate"("userId", "parentRecipeId");

-- AddForeignKey
ALTER TABLE "MealTemplate" ADD CONSTRAINT "MealTemplate_parentRecipeId_fkey" FOREIGN KEY ("parentRecipeId") REFERENCES "MealTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
