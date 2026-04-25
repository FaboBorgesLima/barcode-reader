package com.faboborgeslima.barcode_scanner

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.faboborgeslima.barcode_scanner.data.SessionManager
import com.faboborgeslima.barcode_scanner.databinding.FragmentDashboardBinding
import com.faboborgeslima.barcode_scanner.network.ApiClient
import com.faboborgeslima.barcode_scanner.network.BackendApi
import com.faboborgeslima.barcode_scanner.network.Barcode
import com.faboborgeslima.barcode_scanner.network.CreateBarcodeDto
import com.faboborgeslima.barcode_scanner.network.CreateRoomDto
import com.faboborgeslima.barcode_scanner.network.InitiateAuthDto
import com.faboborgeslima.barcode_scanner.network.LoginDto
import com.faboborgeslima.barcode_scanner.network.RegisterDto
import com.faboborgeslima.barcode_scanner.network.Room
import com.faboborgeslima.barcode_scanner.network.UpdateBarcodeDto
import com.faboborgeslima.barcode_scanner.ui.BarcodeAdapter
import com.faboborgeslima.barcode_scanner.ui.RoomAdapter
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning
import com.google.mlkit.vision.codescanner.GmsBarcodeScanner
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.HttpException

class DashboardFragment : Fragment() {

    private var _binding: FragmentDashboardBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var roomAdapter: RoomAdapter
    private lateinit var barcodeAdapter: BarcodeAdapter

    private var selectedRoom: Room? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        setupLists()
        setupButtons()

        binding.baseUrlInput.setText(sessionManager.getBaseUrl() ?: BuildConfig.API_BASE_URL)

        if (!sessionManager.getToken().isNullOrBlank()) {
            loadUserAndRooms()
        }
    }

    private fun setupLists() {
        roomAdapter = RoomAdapter(
            onRoomClick = { room ->
                selectedRoom = room
                binding.selectedRoomText.text = getString(R.string.selected_room_value, room.name)
                loadBarcodes()
            },
            onDeleteClick = { room -> deleteRoom(room) }
        )

        barcodeAdapter = BarcodeAdapter(
            onIncrement = { barcode -> incrementBarcode(barcode) },
            onDelete = { barcode -> deleteBarcode(barcode) }
        )

        binding.roomsRecyclerView.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = roomAdapter
            setHasFixedSize(true)
        }

        binding.barcodesRecyclerView.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = barcodeAdapter
            setHasFixedSize(true)
        }
    }

    private fun setupButtons() {
        binding.sendOtpButton.setOnClickListener { initiateOtp() }
        binding.loginButton.setOnClickListener { login() }
        binding.registerButton.setOnClickListener { register() }
        binding.logoutButton.setOnClickListener { logout() }

        binding.createRoomButton.setOnClickListener { createRoom() }
        binding.refreshRoomsButton.setOnClickListener { loadRooms() }

        binding.scanBarcodeButton.setOnClickListener { scanBarcode() }
        binding.addBarcodeButton.setOnClickListener { addBarcode() }
        binding.exportButton.setOnClickListener { exportSelectedRoomBarcodes() }
    }

    private fun initiateOtp() = runApi {
        val email = binding.emailInput.text.toString().trim()
        validate(email.isNotBlank()) { getString(R.string.validation_email_required) }

        io { api().authApi.initiate(InitiateAuthDto(email)) }
        showToast(getString(R.string.otp_sent))
    }

    private fun login() = runApi {
        val email = binding.emailInput.text.toString().trim()
        val otp = binding.otpInput.text.toString().trim()
        validate(email.isNotBlank()) { getString(R.string.validation_email_required) }
        validate(otp.isNotBlank()) { getString(R.string.validation_otp_required) }

        val token = io { api().authApi.login(LoginDto(email, otp)).token }
        sessionManager.saveToken(token)
        showToast(getString(R.string.login_success))
        loadUserAndRooms()
    }

    private fun register() = runApi {
        val name = binding.nameInput.text.toString().trim()
        val email = binding.emailInput.text.toString().trim()
        val otp = binding.otpInput.text.toString().trim()
        validate(name.isNotBlank()) { getString(R.string.validation_name_required) }
        validate(email.isNotBlank()) { getString(R.string.validation_email_required) }
        validate(otp.isNotBlank()) { getString(R.string.validation_otp_required) }

        val token = io { api().authApi.register(RegisterDto(name, email, otp)).token }
        sessionManager.saveToken(token)
        showToast(getString(R.string.register_success))
        loadUserAndRooms()
    }

    private fun logout() = runApi {
        io { api().authApi.logout() }
        sessionManager.clearToken()
        binding.currentUserText.text = getString(R.string.no_user)
        roomAdapter.submitList(emptyList())
        barcodeAdapter.submitList(emptyList())
        selectedRoom = null
        binding.selectedRoomText.text = getString(R.string.selected_room_none)
        showToast(getString(R.string.logout_success))
    }

    private fun loadUserAndRooms() = runApi {
        val me = io { api().usersApi.getMe() }
        binding.currentUserText.text = getString(R.string.current_user_value, me.name, me.email)
        loadRoomsInternal()
    }

    private fun loadRooms() = runApi { loadRoomsInternal() }

    private suspend fun loadRoomsInternal() {
        val rooms = io { api().roomsApi.list() }
        roomAdapter.submitList(rooms)
    }

    private fun createRoom() = runApi {
        val roomName = binding.roomNameInput.text.toString().trim()
        validate(roomName.isNotBlank()) { getString(R.string.validation_room_required) }

        io { api().roomsApi.create(CreateRoomDto(roomName)) }
        binding.roomNameInput.text?.clear()
        loadRoomsInternal()
    }

    private fun deleteRoom(room: Room) = runApi {
        io { api().roomsApi.delete(room.id) }
        if (selectedRoom?.id == room.id) {
            selectedRoom = null
            binding.selectedRoomText.text = getString(R.string.selected_room_none)
            barcodeAdapter.submitList(emptyList())
        }
        loadRoomsInternal()
    }

    private fun loadBarcodes() = runApi {
        val room = selectedRoom ?: return@runApi
        val barcodes = io { api().barcodesApi.list(room.id) }
        barcodeAdapter.submitList(barcodes)
    }

    private fun addBarcode() = runApi {
        val room = requireNotNull(selectedRoom) { getString(R.string.validation_select_room) }

        val barcodeValue = binding.barcodeValueInput.text.toString().trim()
        validate(barcodeValue.isNotBlank()) { getString(R.string.validation_barcode_required) }

        io { api().barcodesApi.create(room.id, CreateBarcodeDto(barcodeValue)) }
        binding.barcodeValueInput.text?.clear()
        loadBarcodesInternal(room.id)
    }

    private fun incrementBarcode(barcode: Barcode) = runApi {
        val roomId = selectedRoom?.id ?: barcode.roomId
        io {
            api().barcodesApi.update(
                roomId,
                barcode.id,
                UpdateBarcodeDto(value = barcode.value, quantity = barcode.quantity + 1)
            )
        }
        loadBarcodesInternal(roomId)
    }

    private fun deleteBarcode(barcode: Barcode) = runApi {
        val roomId = selectedRoom?.id ?: barcode.roomId
        io { api().barcodesApi.delete(roomId, barcode.id) }
        loadBarcodesInternal(roomId)
    }

    private fun exportSelectedRoomBarcodes() = runApi {
        val room = requireNotNull(selectedRoom) { getString(R.string.validation_select_room) }

        val items = io { api().barcodesApi.exportAll(room.id) }
        shareAsCsv(room.name, items)
    }

    private suspend fun loadBarcodesInternal(roomId: String) {
        val barcodes = io { api().barcodesApi.list(roomId) }
        barcodeAdapter.submitList(barcodes)
    }

    private fun scanBarcode() {
        if (!validateOrToast(selectedRoom != null, getString(R.string.validation_select_room))) {
            return
        }
        val scanner: GmsBarcodeScanner = GmsBarcodeScanning.getClient(requireActivity())
        scanner.startScan().addOnSuccessListener { scannedBarcode ->
            val value = scannedBarcode.rawValue.orEmpty()
            if (value.isBlank()) {
                showToast(getString(R.string.scan_no_value))
                return@addOnSuccessListener
            }
            binding.barcodeValueInput.setText(value)
            showToast(getString(R.string.scan_success))
        }.addOnFailureListener { throwable ->
            showToast(throwable.message ?: getString(R.string.scan_failed))
        }
    }

    private fun shareAsCsv(roomName: String, items: List<Barcode>) {
        val csv = buildString {
            append("room,barcode,quantity\n")
            items.forEach {
                append(roomName)
                append(',')
                append(it.value)
                append(',')
                append(it.quantity)
                append('\n')
            }
        }

        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, getString(R.string.export_subject, roomName))
            putExtra(Intent.EXTRA_TEXT, csv)
        }
        startActivity(Intent.createChooser(shareIntent, getString(R.string.export_share_title)))
    }

    private fun runApi(block: suspend () -> Unit) {
        lifecycleScope.launch {
            binding.progressBar.visibility = View.VISIBLE
            try {
                block()
            } catch (e: Exception) {
                showToast(formatError(e))
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    private suspend fun <T> io(block: suspend () -> T): T = withContext(Dispatchers.IO) { block() }

    private fun api(): BackendApi {
        val baseUrl = binding.baseUrlInput.text.toString().trim().ifBlank { BuildConfig.API_BASE_URL }
        sessionManager.saveBaseUrl(baseUrl)
        return ApiClient.get(baseUrl, sessionManager)
    }

    private fun validate(condition: Boolean, message: () -> String) {
        if (!condition) {
            throw IllegalArgumentException(message())
        }
    }

    private fun validateOrToast(condition: Boolean, message: String): Boolean {
        if (!condition) {
            showToast(message)
            return false
        }
        return true
    }

    private fun formatError(error: Exception): String {
        return when (error) {
            is HttpException -> {
                val body = error.response()?.errorBody()?.string()?.takeIf { it.isNotBlank() }
                body ?: getString(R.string.http_error, error.code())
            }
            is IllegalArgumentException -> error.message ?: getString(R.string.error_generic)
            else -> error.message ?: getString(R.string.error_generic)
        }
    }

    private fun showToast(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}



