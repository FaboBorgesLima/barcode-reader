package com.example.barcodescannerandsheetexport.network

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.PATCH
import retrofit2.http.Path
import retrofit2.http.Query

interface AuthApi {
    @POST("api/auth/initiate")
    suspend fun initiate(@Body body: InitiateAuthDto)

    @POST("api/auth/login")
    suspend fun login(@Body body: LoginDto): TokenResponseDto

    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterDto): TokenResponseDto

    @POST("api/auth/logout")
    suspend fun logout()
}

interface UsersApi {
    @GET("api/users/me")
    suspend fun getMe(): User

    @PATCH("api/users/me")
    suspend fun updateMe(@Body body: Map<String, Any>): User

    @DELETE("api/users/me")
    suspend fun deleteMe()
}

interface RoomsApi {
    @GET("api/rooms")
    suspend fun list(
        @Query("page") page: Int? = null,
        @Query("pageSize") pageSize: Int? = null
    ): List<Room>

    @POST("api/rooms")
    suspend fun create(@Body body: CreateRoomDto): Room

    @PUT("api/rooms/{id}")
    suspend fun update(@Path("id") id: String, @Body body: UpdateRoomDto): Room

    @DELETE("api/rooms/{id}")
    suspend fun delete(@Path("id") id: String)
}

interface BarcodesApi {
    @GET("api/rooms/{roomId}/barcodes")
    suspend fun list(
        @Path("roomId") roomId: String,
        @Query("page") page: Int? = null,
        @Query("pageSize") pageSize: Int? = null
    ): List<Barcode>

    @POST("api/rooms/{roomId}/barcodes")
    suspend fun create(@Path("roomId") roomId: String, @Body body: CreateBarcodeDto): Barcode

    @PUT("api/rooms/{roomId}/barcodes/{id}")
    suspend fun update(
        @Path("roomId") roomId: String,
        @Path("id") id: String,
        @Body body: UpdateBarcodeDto
    ): Barcode

    @DELETE("api/rooms/{roomId}/barcodes/{id}")
    suspend fun delete(@Path("roomId") roomId: String, @Path("id") id: String)

    @GET("api/rooms/{roomId}/barcodes/export")
    suspend fun exportAll(@Path("roomId") roomId: String): List<Barcode>
}

