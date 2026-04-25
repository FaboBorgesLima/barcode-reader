package com.faboborgeslima.barcode_scanner.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.faboborgeslima.barcode_scanner.databinding.ItemRoomBinding
import com.faboborgeslima.barcode_scanner.network.Room

class RoomAdapter(
    private val onRoomClick: (Room) -> Unit,
    private val onDeleteClick: (Room) -> Unit
) : RecyclerView.Adapter<RoomAdapter.ViewHolder>() {

    private val rooms = mutableListOf<Room>()

    fun submitList(items: List<Room>) {
        rooms.clear()
        rooms.addAll(items)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemRoomBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(rooms[position])
    override fun getItemCount() = rooms.size

    inner class ViewHolder(private val b: ItemRoomBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(room: Room) {
            b.roomName.text = room.name
            b.root.setOnClickListener { onRoomClick(room) }
            b.deleteRoomButton.setOnClickListener { onDeleteClick(room) }
        }
    }
}
