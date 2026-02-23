# RX5808-Div Configurator

Web-based firmware installer for the [RX5808-Div](https://github.com/LochnessFPV/RX5808-Div) diversity FPV video receiver. Flash firmware directly from your browser via Web Serial — no drivers or software required.

## Latest Firmware

<!-- LATEST_FIRMWARE_START -->
**Latest:** [v1.8.0](https://github.com/LochnessFPV/RX5808-Div/releases/tag/v1.8.0) — v1.8.0 - UX Overhaul & Performance (2026-02-23)
<!-- LATEST_FIRMWARE_END -->

## Usage

Open the configurator at `https://lochnessfpv.github.io/RX5808-Div-Configurator/`, connect your ESP32 via USB, select a firmware version, and click **Install**.

## Development

Run `script/develop`. This starts a local dev server at http://localhost:5001.

## Firmware Sync

The [sync-firmware workflow](.github/workflows/sync-firmware.yml) runs daily and on demand to pull new releases from [LochnessFPV/RX5808-Div](https://github.com/LochnessFPV/RX5808-Div) and update `firmware/` and this README automatically.

Built on [ESP Web Tools](https://esphome.github.io/esp-web-tools/) by ESPHome.

