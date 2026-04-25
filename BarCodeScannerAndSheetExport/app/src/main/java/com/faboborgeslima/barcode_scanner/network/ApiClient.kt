package com.faboborgeslima.barcode_scanner.network

import com.faboborgeslima.barcode_scanner.data.SessionManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class AuthInterceptor(private val sessionManager: SessionManager) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val requestBuilder = chain.request().newBuilder()
        sessionManager.getToken()?.takeIf { it.isNotBlank() }?.let { token ->
            requestBuilder.addHeader("Authorization", "Bearer $token")
        }
        return chain.proceed(requestBuilder.build())
    }
}

data class BackendApi(
    val authApi: AuthApi,
    val usersApi: UsersApi,
    val roomsApi: RoomsApi,
    val barcodesApi: BarcodesApi
)

object ApiClient {
    private var lastBaseUrl: String? = null
    private var cachedApi: BackendApi? = null

    fun get(baseUrl: String, sessionManager: SessionManager): BackendApi {
        val normalizedBaseUrl = normalizeBaseUrl(baseUrl)
        cachedApi?.takeIf { normalizedBaseUrl == lastBaseUrl }?.let { return it }

        val logger = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(sessionManager))
            .addInterceptor(logger)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(normalizedBaseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .client(client)
            .build()

        return BackendApi(
            authApi = retrofit.create(AuthApi::class.java),
            usersApi = retrofit.create(UsersApi::class.java),
            roomsApi = retrofit.create(RoomsApi::class.java),
            barcodesApi = retrofit.create(BarcodesApi::class.java)
        ).also {
            cachedApi = it
            lastBaseUrl = normalizedBaseUrl
        }
    }

    private fun normalizeBaseUrl(baseUrl: String): String {
        val trimmed = baseUrl.trim()
        return if (trimmed.endsWith('/')) trimmed else "$trimmed/"
    }
}

