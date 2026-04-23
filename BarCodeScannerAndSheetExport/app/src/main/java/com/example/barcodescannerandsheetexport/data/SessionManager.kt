package com.example.barcodescannerandsheetexport.data

import android.content.Context
import androidx.core.content.edit

class SessionManager(context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun saveToken(token: String) {
        prefs.edit() { putString(KEY_TOKEN, token) }
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun clearToken() {
        prefs.edit() { remove(KEY_TOKEN) }
    }

    fun saveBaseUrl(baseUrl: String) {
        prefs.edit() { putString(KEY_BASE_URL, baseUrl) }
    }

    fun getBaseUrl(): String? = prefs.getString(KEY_BASE_URL, null)

    companion object {
        private const val PREFS_NAME = "barcode_frontend_prefs"
        private const val KEY_TOKEN = "jwt_token"
        private const val KEY_BASE_URL = "base_url"
    }
}

