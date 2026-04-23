package com.example.barcodescannerandsheetexport.network

data class InitiateAuthDto(val email: String)

data class LoginDto(
    val email: String,
    val credential: String
)

data class RegisterDto(
    val name: String,
    val email: String,
    val credential: String
)

data class TokenResponseDto(val token: String)

data class User(
    val id: String,
    val name: String,
    val email: String
)

data class CreateRoomDto(val name: String)

data class UpdateRoomDto(val name: String)

data class Room(
    val id: String,
    val name: String,
    val userId: String
)

data class CreateBarcodeDto(val value: String)

data class UpdateBarcodeDto(
    val value: String,
    val quantity: Int
)

data class Barcode(
    val id: String,
    val value: String,
    val roomId: String,
    val quantity: Int
)

