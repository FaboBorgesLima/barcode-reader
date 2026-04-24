import { Barcode } from '../../../model/barcode';

export class BarcodeView {
  displayBarcode(barcode: Barcode): void {
    console.log(`\n  ID:       ${barcode.id}`);
    console.log(`  Value:    ${barcode.value}`);
    console.log(`  Room ID:  ${barcode.roomId}`);
    console.log(`  Quantity: ${barcode.quantity}`);
  }

  displayList(barcodes: Barcode[]): void {
    if (barcodes.length === 0) {
      console.log('\n  No barcodes found');
      return;
    }
    console.log(`\n  ${barcodes.length} barcode(s):`);
    for (const b of barcodes) {
      console.log(`    [${b.id}] ${b.value} (qty: ${b.quantity})`);
    }
  }

  displayDeleted(id: string): void {
    console.log(`\n  Barcode "${id}" deleted`);
  }

  displayError(message: string): void {
    console.error(`\n  Error: ${message}`);
  }
}
