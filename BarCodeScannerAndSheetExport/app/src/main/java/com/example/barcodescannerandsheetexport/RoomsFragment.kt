package com.example.barcodescannerandsheetexport

import android.os.Bundle
import android.view.LayoutInflater
import android.view.Menu
import android.view.MenuInflater
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.FrameLayout
import androidx.appcompat.app.AlertDialog
import androidx.core.view.MenuHost
import androidx.core.view.MenuProvider
import androidx.lifecycle.Lifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.barcodescannerandsheetexport.databinding.FragmentRoomsBinding
import com.example.barcodescannerandsheetexport.network.CreateRoomDto
import com.example.barcodescannerandsheetexport.network.Room
import com.example.barcodescannerandsheetexport.ui.RoomAdapter

class RoomsFragment : BaseFragment() {

    private var _binding: FragmentRoomsBinding? = null
    private val binding get() = _binding!!

    private lateinit var adapter: RoomAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRoomsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupMenu()

        adapter = RoomAdapter(
            onRoomClick = { room -> openRoom(room) },
            onDeleteClick = { room -> confirmDeleteRoom(room) }
        )

        binding.roomsRecycler.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = this@RoomsFragment.adapter
        }

        binding.fabAddRoom.setOnClickListener { showCreateRoomDialog() }

        loadRooms()
    }

    private fun setupMenu() {
        (requireActivity() as MenuHost).addMenuProvider(object : MenuProvider {
            override fun onCreateMenu(menu: Menu, menuInflater: MenuInflater) {
                menuInflater.inflate(R.menu.menu_rooms, menu)
            }

            override fun onMenuItemSelected(menuItem: MenuItem): Boolean {
                return when (menuItem.itemId) {
                    R.id.action_logout -> { logout(); true }
                    else -> false
                }
            }
        }, viewLifecycleOwner, Lifecycle.State.RESUMED)
    }

    private fun loadRooms() = launchApi {
        val rooms = io { api().roomsApi.list() }
        adapter.submitList(rooms)
        binding.emptyState.visibility = if (rooms.isEmpty()) View.VISIBLE else View.GONE
        binding.roomsRecycler.visibility = if (rooms.isEmpty()) View.GONE else View.VISIBLE
    }

    private fun openRoom(room: Room) {
        val bundle = Bundle().apply {
            putString("roomId", room.id)
            putString("roomName", room.name)
        }
        findNavController().navigate(R.id.action_rooms_to_detail, bundle)
    }

    private fun showCreateRoomDialog() {
        val input = EditText(requireContext()).apply {
            hint = getString(R.string.room_name)
            inputType = android.text.InputType.TYPE_CLASS_TEXT or
                    android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
        }
        val paddingPx = (24 * resources.displayMetrics.density).toInt()
        val container = FrameLayout(requireContext()).apply {
            setPadding(paddingPx, paddingPx / 2, paddingPx, 0)
            addView(input)
        }

        AlertDialog.Builder(requireContext())
            .setTitle(R.string.create_room_dialog_title)
            .setView(container)
            .setPositiveButton(R.string.create_room) { _, _ ->
                val name = input.text.toString().trim()
                if (name.isNotBlank()) createRoom(name)
                else toast(getString(R.string.validation_room_required))
            }
            .setNegativeButton(android.R.string.cancel, null)
            .show()

        input.requestFocus()
    }

    private fun createRoom(name: String) = launchApi {
        io { api().roomsApi.create(CreateRoomDto(name)) }
        loadRooms()
    }

    private fun confirmDeleteRoom(room: Room) {
        AlertDialog.Builder(requireContext())
            .setTitle(R.string.delete)
            .setMessage(getString(R.string.delete_room_confirm, room.name))
            .setPositiveButton(R.string.delete) { _, _ ->
                launchApi {
                    io { api().roomsApi.delete(room.id) }
                    loadRooms()
                }
            }
            .setNegativeButton(android.R.string.cancel, null)
            .show()
    }

    private fun logout() = launchApi {
        try { io { api().authApi.logout() } } catch (_: Exception) { }
        sessionManager.clearToken()
        findNavController().navigate(R.id.action_rooms_to_login)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

