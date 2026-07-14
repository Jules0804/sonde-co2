#pragma once

#include <array>
#include <cstddef>
#include <cstdint>

#include "http_api_contract.hpp"

namespace ventilation {

constexpr size_t kSessionTokenBytes = 32U;   // 256 bits
constexpr size_t kCsrfTokenBytes = 24U;      // 192 bits
constexpr size_t kMaxSessions = 2U;
constexpr uint32_t kLoginLockDurationSeconds = 30U;
constexpr uint32_t kPasswordMinLength = 12U;
constexpr uint32_t kPasswordMaxLength = 128U;

using SessionToken = std::array<uint8_t, kSessionTokenBytes>;
using CsrfToken = std::array<uint8_t, kCsrfTokenBytes>;

enum class AuthStatus : uint8_t {
  kOk,
  kAuthRequired,
  kForbidden,
  kCsrfRequired,
  kInvalidCredentials,
  kLoginLocked,
  kNoSessionSlot,
  kExpired,
};

struct LoginFailureState {
  uint8_t count{0U};
  uint64_t locked_until_ms{0U};
};

struct SessionRecord {
  bool active{false};
  ApiRole role{ApiRole::kPublic};
  SessionToken token{};
  CsrfToken csrf{};
  uint64_t expires_at_ms{0U};
  uint32_t generation{0U};
};

struct AuthCheck {
  AuthStatus status;
  const SessionRecord* session;
};

struct LoginResult {
  AuthStatus status;
  const SessionRecord* session;
  uint32_t retry_after_seconds;
};

class LocalAuth {
 public:
  LocalAuth() = default;

  LoginResult open_session(ApiRole role,
                           bool password_valid,
                           const SessionToken& token,
                           const CsrfToken& csrf,
                           uint64_t now_ms);
  AuthCheck authorize(const SessionToken* token,
                      ApiRole minimum_role,
                      bool csrf_required,
                      const CsrfToken* csrf,
                      uint64_t now_ms);
  bool close_session(const SessionToken& token);
  void invalidate_all();
  const LoginFailureState& failures() const { return failures_; }
  uint32_t session_generation() const { return session_generation_; }

 private:
  const SessionRecord* find_session(const SessionToken& token, uint64_t now_ms);
  SessionRecord* writable_slot();
  void record_failure(uint64_t now_ms);
  void clear_failures();

  std::array<SessionRecord, kMaxSessions> sessions_{};
  LoginFailureState failures_{};
  uint32_t session_generation_{0U};
};

bool constant_time_equal(const uint8_t* left, const uint8_t* right, size_t length);
bool role_allows(ApiRole actual, ApiRole minimum);
const char* to_string(AuthStatus status);

}  // namespace ventilation
