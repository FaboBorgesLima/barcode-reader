package com.example.barcodescannerandsheetexport

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import androidx.navigation.fragment.findNavController
import com.example.barcodescannerandsheetexport.databinding.FragmentLoginBinding
import com.example.barcodescannerandsheetexport.network.InitiateAuthDto
import com.example.barcodescannerandsheetexport.network.LoginDto
import com.example.barcodescannerandsheetexport.network.RegisterDto

class LoginFragment : BaseFragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    private var isRegisterMode = false
    private var otpSent = false

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Auto-navigate if already logged in
        if (!sessionManager.getToken().isNullOrBlank()) {
            view.post { if (isAdded) findNavController().navigate(R.id.action_login_to_rooms) }
            return
        }

        // XML equivalent of Compose's imePadding():
        // When the keyboard opens, add bottom padding equal to the keyboard height so
        // the ScrollView shrinks and the OTP field stays visible above the keyboard.
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { v, insets ->
            val imeBottom = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
            val navBottom = insets.getInsets(WindowInsetsCompat.Type.systemBars()).bottom
            v.updatePadding(bottom = maxOf(imeBottom, navBottom))
            insets
        }

        binding.modeToggle.addOnButtonCheckedListener { _, checkedId, isChecked ->
            if (isChecked) {
                isRegisterMode = checkedId == R.id.btn_register_mode
                updateMode()
            }
        }

        binding.sendOtpButton.setOnClickListener { sendOtp() }
        binding.actionButton.setOnClickListener { submitAction() }
    }

    private fun updateMode() {
        binding.nameLayout.visibility = if (isRegisterMode) View.VISIBLE else View.GONE
        binding.loginInstructions.text = getString(
            if (isRegisterMode) R.string.login_instructions_register
            else R.string.login_instructions_login
        )
        binding.actionButton.text = getString(
            if (isRegisterMode) R.string.register else R.string.login
        )
        // Reset OTP step when switching modes
        otpSent = false
        binding.otpLayout.visibility = View.GONE
        binding.actionButton.visibility = View.GONE
        binding.otpInput.text?.clear()
    }

    private fun sendOtp() {
        val email = binding.emailInput.text.toString().trim()
        if (email.isBlank()) {
            binding.emailLayout.error = getString(R.string.validation_email_required)
            return
        }
        binding.emailLayout.error = null

        launchApi {
            setLoading(true)
            io { api().authApi.initiate(InitiateAuthDto(email)) }
            otpSent = true
            binding.otpLayout.visibility = View.VISIBLE
            binding.actionButton.visibility = View.VISIBLE
            toast(getString(R.string.otp_sent))
            setLoading(false)
        }
    }

    private fun submitAction() {
        val email = binding.emailInput.text.toString().trim()
        val otp = binding.otpInput.text.toString().trim()

        if (email.isBlank()) {
            binding.emailLayout.error = getString(R.string.validation_email_required)
            return
        }
        if (otp.isBlank()) {
            binding.otpLayout.error = getString(R.string.validation_otp_required)
            return
        }
        binding.emailLayout.error = null
        binding.otpLayout.error = null

        launchApi {
            setLoading(true)
            val token = if (isRegisterMode) {
                val name = binding.nameInput.text.toString().trim()
                if (name.isBlank()) {
                    binding.nameLayout.error = getString(R.string.validation_name_required)
                    setLoading(false)
                    return@launchApi
                }
                io { api().authApi.register(RegisterDto(name, email, otp)).token }
            } else {
                io { api().authApi.login(LoginDto(email, otp)).token }
            }
            sessionManager.saveToken(token)
            toast(getString(if (isRegisterMode) R.string.register_success else R.string.login_success))
            setLoading(false)
            findNavController().navigate(R.id.action_login_to_rooms)
        }
    }

    private fun setLoading(loading: Boolean) {
        binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        binding.sendOtpButton.isEnabled = !loading
        binding.actionButton.isEnabled = !loading
        binding.modeToggle.isEnabled = !loading
        binding.emailInput.isEnabled = !loading
        binding.otpInput.isEnabled = !loading
        binding.nameInput.isEnabled = !loading
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
