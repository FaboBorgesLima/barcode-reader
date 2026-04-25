/*
  Warnings:

  - A unique constraint covering the columns `[value,roomId]` on the table `Barcode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Barcode_value_roomId_key" ON "Barcode"("value", "roomId");
