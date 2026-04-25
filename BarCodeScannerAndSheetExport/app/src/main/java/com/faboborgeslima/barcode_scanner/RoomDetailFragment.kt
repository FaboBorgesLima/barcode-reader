package com.faboborgeslima.barcode_scanner

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.FileProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.faboborgeslima.barcode_scanner.databinding.FragmentRoomDetailBinding
import com.faboborgeslima.barcode_scanner.network.Barcode
import com.faboborgeslima.barcode_scanner.network.CreateBarcodeDto
import com.faboborgeslima.barcode_scanner.network.UpdateBarcodeDto
import com.faboborgeslima.barcode_scanner.ui.BarcodeAdapter
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning
import java.io.File

class RoomDetailFragment : BaseFragment() {

    private var _binding: FragmentRoomDetailBinding? = null
    private val binding get() = _binding!!

    private lateinit var adapter: BarcodeAdapter

    private val roomId by lazy { requireArguments().getString("roomId")!! }
    private val roomName by lazy { requireArguments().getString("roomName")!! }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRoomDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        requireActivity().title = roomName

        adapter = BarcodeAdapter(
            onIncrement = { barcode -> incrementBarcode(barcode) },
            onDelete = { barcode -> deleteBarcode(barcode) }
        )

        binding.barcodesRecycler.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = this@RoomDetailFragment.adapter
        }

        binding.fabScan.setOnClickListener { startScan() }
        binding.exportButton.setOnClickListener { exportBarcodes() }

        loadBarcodes()
    }

    private fun loadBarcodes() = launchApi {
        val barcodes = io { api().barcodesApi.list(roomId) }
        adapter.submitList(barcodes)
        val isEmpty = barcodes.isEmpty()
        binding.emptyState.visibility = if (isEmpty) View.VISIBLE else View.GONE
        binding.barcodesRecycler.visibility = if (isEmpty) View.GONE else View.VISIBLE
    }

    private fun startScan() {
        GmsBarcodeScanning.getClient(requireActivity()).startScan()
            .addOnSuccessListener { scanned ->
                val value = scanned.rawValue.orEmpty()
                if (value.isBlank()) {
                    toast(getString(R.string.scan_no_value))
                    return@addOnSuccessListener
                }
                launchApi {
                    io { api().barcodesApi.create(roomId, CreateBarcodeDto(value)) }
                    loadBarcodes()
                    toast(getString(R.string.scan_success))
                }
            }
            .addOnFailureListener { e ->
                toast(e.message ?: getString(R.string.scan_failed))
            }
    }

    private fun incrementBarcode(barcode: Barcode) = launchApi {
        io {
            api().barcodesApi.update(
                roomId, barcode.id,
                UpdateBarcodeDto(value = barcode.value, quantity = barcode.quantity + 1)
            )
        }
        loadBarcodes()
    }

    private fun deleteBarcode(barcode: Barcode) = launchApi {
        io { api().barcodesApi.delete(roomId, barcode.id) }
        loadBarcodes()
    }

    private fun exportBarcodes() = launchApi {
        val barcodes = io { api().barcodesApi.exportAll(roomId) }
        if (barcodes.isEmpty()) {
            toast(getString(R.string.no_barcodes_to_export))
            return@launchApi
        }
        shareCsv(barcodes)
    }

    private fun shareCsv(barcodes: List<Barcode>) {
        val safeRoomName = roomName.replace(Regex("[^a-zA-Z0-9_-]"), "_")
        val csv = buildString {
            appendLine("barcode,quantity")
            barcodes.forEach { appendLine("${it.value},${it.quantity}") }
        }

        val cacheDir = File(requireContext().cacheDir, "csv").also { it.mkdirs() }
        val file = File(cacheDir, "${safeRoomName}_barcodes.csv")
        file.writeText(csv)

        val uri = FileProvider.getUriForFile(
            requireContext(),
            "${requireContext().packageName}.fileprovider",
            file
        )

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/csv"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, getString(R.string.export_subject, roomName))
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivity(Intent.createChooser(intent, getString(R.string.export_share_title)))
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

