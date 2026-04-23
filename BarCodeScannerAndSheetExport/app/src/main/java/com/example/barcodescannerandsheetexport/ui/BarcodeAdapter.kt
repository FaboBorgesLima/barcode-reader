package com.example.barcodescannerandsheetexport.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.barcodescannerandsheetexport.databinding.ItemBarcodeBinding
import com.example.barcodescannerandsheetexport.network.Barcode

class BarcodeAdapter(
    private val onIncrement: (Barcode) -> Unit,
    private val onDelete: (Barcode) -> Unit
) : RecyclerView.Adapter<BarcodeAdapter.ViewHolder>() {

    private val barcodes = mutableListOf<Barcode>()

    fun submitList(items: List<Barcode>) {
        barcodes.clear()
        barcodes.addAll(items)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemBarcodeBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(barcodes[position])
    override fun getItemCount() = barcodes.size

    inner class ViewHolder(private val b: ItemBarcodeBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(barcode: Barcode) {
            b.barcodeValue.text = barcode.value
            b.barcodeQuantity.text = b.root.context.getString(
                com.example.barcodescannerandsheetexport.R.string.quantity_label,
                barcode.quantity
            )
            b.incrementButton.setOnClickListener { onIncrement(barcode) }
            b.deleteBarcodeButton.setOnClickListener { onDelete(barcode) }
        }
    }
}
