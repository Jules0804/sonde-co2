#include <cstdint>

#include "esp_log.h"
#include "esp_timer.h"
#include "nvs_flash.h"

#include "config_store.hpp"
#include "control_core.hpp"
#include "history_log.hpp"
#include "service_mode.hpp"

namespace {
constexpr char kTag[] = "ventilation";

ventilation::ControlConfig control_config_from_persistent(
    const ventilation::PersistentConfig& persistent) {
  ventilation::ControlConfig config;
  config.target_ppm = static_cast<float>(persistent.target_ppm);
  config.min_output_pct = persistent.min_output_pct;
  config.max_output_pct = persistent.max_output_pct;
  config.high_alarm_ppm = static_cast<float>(persistent.high_alarm_ppm);
  config.high_alarm_delay_ms = static_cast<uint32_t>(persistent.alarm_delay_s) * 1000U;
  return config;
}

ventilation::HistoryState history_state_from_control(ventilation::ControlState state) {
  switch (state) {
    case ventilation::ControlState::kStartup: return ventilation::HistoryState::kStartup;
    case ventilation::ControlState::kAuto: return ventilation::HistoryState::kAuto;
    case ventilation::ControlState::kForceOpen: return ventilation::HistoryState::kForceOpen;
    case ventilation::ControlState::kFault: return ventilation::HistoryState::kFault;
  }
  return ventilation::HistoryState::kFault;
}

ventilation::HistoryFault history_fault_from_control(ventilation::FaultCode fault) {
  switch (fault) {
    case ventilation::FaultCode::kNone: return ventilation::HistoryFault::kNone;
    case ventilation::FaultCode::kSensorMissing: return ventilation::HistoryFault::kSensorMissing;
    case ventilation::FaultCode::kSensorRange: return ventilation::HistoryFault::kSensorRange;
    case ventilation::FaultCode::kHighCo2: return ventilation::HistoryFault::kHighCo2;
  }
  return ventilation::HistoryFault::kHistoryStorageFailed;
}

ventilation::ServiceMode service_mode(15U * 60U * 1000U);
}  // namespace

extern "C" void app_main() {
  const esp_err_t nvs_result = nvs_flash_init();
  if (nvs_result != ESP_OK) {
    ESP_LOGE(kTag, "Initialisation NVS impossible: %s", esp_err_to_name(nvs_result));
  }

  const auto persistent_config = ventilation::factory_config();
  ventilation::Controller controller(control_config_from_persistent(persistent_config));
  const uint64_t now_ms = static_cast<uint64_t>(esp_timer_get_time() / 1000);

  const auto service_snapshot = service_mode.update(ventilation::ServiceInput{
      .now_ms = now_ms,
      .button_pressed = false,
      .wifi_event = ventilation::ServiceWifiEvent::kNone,
      .close_requested = false,
  });

  // Tant que les pilotes du lot 1 ne sont pas integres, l'entree sonde reste
  // invalide et le noyau demande donc la sortie de securite a 100 %.
  const ventilation::ControlInput safe_input{
      .timestamp_ms = now_ms,
      .co2_ppm = 0.0F,
      .co2_valid = false,
      .force_open = false,
  };
  const auto snapshot = controller.update(safe_input);

  ventilation::HistoryRecord history_record;
  const bool history_encoded = ventilation::encode_history_record(
      ventilation::HistorySample{
          .sequence = 0U,
          .epoch_seconds = 0U,
          .uptime_seconds = static_cast<uint32_t>(now_ms / 1000U),
          .boot_id = 0U,
          .co2_ppm = ventilation::kHistoryNullCo2Ppm,
          .output_pct = snapshot.output_pct,
          .state = history_state_from_control(snapshot.state),
          .fault = history_fault_from_control(snapshot.fault),
          .flags = 0U,
      },
      history_record);

  ventilation::EventRecord boot_event;
  const bool event_encoded = ventilation::encode_event_record(
      ventilation::EventEntry{
          .sequence = 0U,
          .epoch_seconds = 0U,
          .uptime_seconds = static_cast<uint32_t>(now_ms / 1000U),
          .boot_id = 0U,
          .code = ventilation::EventCode::kBoot,
          .severity = nvs_result == ESP_OK ? ventilation::EventSeverity::kInfo
                                           : ventilation::EventSeverity::kWarning,
          .source = ventilation::EventSource::kSystem,
          .count = 1U,
          .detail0 = static_cast<int32_t>(nvs_result),
          .detail1 = static_cast<int32_t>(service_snapshot.session_generation),
      },
      boot_event);

  ESP_LOGW(kTag,
           "Squelette firmware: etat=%s defaut=%s sortie=%.1f%% service=%s historique=%s evenement=%s",
           ventilation::to_string(snapshot.state),
           ventilation::to_string(snapshot.fault),
           snapshot.output_pct,
           ventilation::to_string(service_snapshot.state),
           history_encoded ? "ok" : "erreur",
           event_encoded ? "ok" : "erreur");

  // Le modele de reference du bouton 3 s et de la fenetre Wi-Fi 15 min est
  // verifie dans le simulateur. Son raccordement au GPIO, aux evenements Wi-Fi,
  // au serveur HTTP et a l'invalidation des sessions attend l'identification de
  // la carte. Ne pas piloter de sortie reelle avant les essais de reception.
}
