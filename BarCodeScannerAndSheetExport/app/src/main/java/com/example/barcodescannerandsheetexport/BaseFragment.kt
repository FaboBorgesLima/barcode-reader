package com.example.barcodescannerandsheetexport

import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.barcodescannerandsheetexport.data.SessionManager
import com.example.barcodescannerandsheetexport.network.ApiClient
import com.example.barcodescannerandsheetexport.network.BackendApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.HttpException

abstract class BaseFragment : Fragment() {

    protected val sessionManager by lazy { SessionManager(requireContext()) }

    protected fun api(): BackendApi {
        return ApiClient.get(BuildConfig.API_BASE_URL, sessionManager)
    }

    protected fun launchApi(block: suspend () -> Unit) {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                block()
            } catch (e: Exception) {
                onApiError(e)
            }
        }
    }

    protected open fun onApiError(e: Exception) {
        val msg = when (e) {
            is HttpException -> {
                val body = e.response()?.errorBody()?.string()?.takeIf { it.isNotBlank() }
                body ?: "HTTP ${e.code()}: ${e.message()}"
            }
            is IllegalArgumentException,
            is IllegalStateException -> e.message ?: getString(R.string.error_generic)
            else -> e.message ?: getString(R.string.error_generic)
        }
        toast(msg)
    }

    protected fun toast(msg: String) {
        if (isAdded) Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show()
    }

    protected suspend fun <T> io(block: suspend () -> T): T =
        withContext(Dispatchers.IO) { block() }
}


