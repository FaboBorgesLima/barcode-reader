# BarCodeScannerAndSheetExport

Android frontend for the provided Barcode Scanner API (`app/docs-json.json`).

## Features

- OTP auth flow: initiate, login, register, logout
- JWT persistence with automatic `Authorization: Bearer <token>` header
- Rooms: list, create, delete, select
- Barcodes (per room): list, create, delete, increment quantity
- Native barcode reader using Google Play Services Code Scanner
- Export room barcodes as CSV text via Android share sheet

## Configure API URL

The app uses `BuildConfig.API_BASE_URL` default:

- `http://10.0.2.2:3000/` (Android emulator -> host machine)

You can also change the base URL at runtime in the app UI.

## Build

```bash
./gradlew :app:assembleDebug
```

## Run

1. Open in Android Studio.
2. Run on emulator/device with Google Play Services.
3. In the first field, set your backend URL if needed.
4. Use OTP auth buttons, then manage rooms/barcodes.

## Notes

- Internet permission is enabled in `app/src/main/AndroidManifest.xml`.
- Scanner dependency: `com.google.android.gms:play-services-code-scanner`.

