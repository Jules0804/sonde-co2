#include "local_auth.hpp"

namespace ventilation {

bool constant_time_equal(const uint8_t* left, const uint8_t* right, size_t length) {
  if (left == nullptr || right == nullptr) return false;
  uint8_t diff = 0U;
  for (size_t index = 0U; index < length; ++index) diff |= static_cast<uint8_t>(left[index] ^ right[index]);
  return diff == 0U;
}

bool role_allows(ApiRole actual, ApiRole minimum) {
  return static_cast<uint8_t>(actual) >= static_cast<uint8_t>(minimum);
}

const SessionRecord* LocalAuth::find_session(const SessionToken& token, uint64_t now_ms) {
  for (auto& session : sessions_) {
    if (session.active && session.expires_at_ms <= now_ms) session.active = false;
    if (session.active && constant_time_equal(session.token.data(), token.data(), token.size())) return &session;
  }
  return nullptr;
}

SessionRecord* LocalAuth::writable_slot() {
  for (auto& session : sessions_) {
    if (!session.active) return &session;
  }
  return nullptr;
}

void LocalAuth::record_failure(uint64_t now_ms) {
  if (failures_.locked_until_ms > now_ms) return;
  if (failures_.count < kApiMaxFailedLoginBeforeLock) ++failures_.count;
  if (failures_.count >= kApiMaxFailedLoginBeforeLock) {
    failures_.locked_until_ms = now_ms + static_cast<uint64_t>(kLoginLockDurationSeconds) * 1000ULL;
  }
}

void LocalAuth::clear_failures() {
  failures_ = LoginFailureState{};
}

LoginResult LocalAuth::open_session(ApiRole role,
                                    bool password_valid,
                                    const SessionToken& token,
                                    const CsrfToken& csrf,
                                    uint64_t now_ms) {
  if (failures_.locked_until_ms > now_ms) {
    const auto remaining_ms = failures_.locked_until_ms - now_ms;
    return LoginResult{AuthStatus::kLoginLocked, nullptr,
                       static_cast<uint32_t>((remaining_ms + 999ULL) / 1000ULL)};
  }
  if (!password_valid || role == ApiRole::kPublic) {
    record_failure(now_ms);
    return LoginResult{AuthStatus::kInvalidCredentials, nullptr, 0U};
  }

  auto* slot = writable_slot();
  if (slot == nullptr) return LoginResult{AuthStatus::kNoSessionSlot, nullptr, 0U};
  clear_failures();
  ++session_generation_;
  *slot = SessionRecord{
      .active = true,
      .role = role,
      .token = token,
      .csrf = csrf,
      .expires_at_ms = now_ms + static_cast<uint64_t>(kApiSessionDurationSeconds) * 1000ULL,
      .generation = session_generation_,
  };
  return LoginResult{AuthStatus::kOk, slot, 0U};
}

AuthCheck LocalAuth::authorize(const SessionToken* token,
                               ApiRole minimum_role,
                               bool csrf_required,
                               const CsrfToken* csrf,
                               uint64_t now_ms) {
  if (token == nullptr) return AuthCheck{AuthStatus::kAuthRequired, nullptr};
  const auto* session = find_session(*token, now_ms);
  if (session == nullptr) return AuthCheck{AuthStatus::kAuthRequired, nullptr};
  if (!role_allows(session->role, minimum_role)) return AuthCheck{AuthStatus::kForbidden, session};
  if (csrf_required) {
    if (csrf == nullptr || !constant_time_equal(session->csrf.data(), csrf->data(), session->csrf.size())) {
      return AuthCheck{AuthStatus::kCsrfRequired, session};
    }
  }
  return AuthCheck{AuthStatus::kOk, session};
}

bool LocalAuth::close_session(const SessionToken& token) {
  for (auto& session : sessions_) {
    if (session.active && constant_time_equal(session.token.data(), token.data(), token.size())) {
      session.active = false;
      ++session_generation_;
      return true;
    }
  }
  return false;
}

void LocalAuth::invalidate_all() {
  for (auto& session : sessions_) session.active = false;
  ++session_generation_;
}

const char* to_string(AuthStatus status) {
  switch (status) {
    case AuthStatus::kOk: return "OK";
    case AuthStatus::kAuthRequired: return "AUTH_REQUIRED";
    case AuthStatus::kForbidden: return "FORBIDDEN";
    case AuthStatus::kCsrfRequired: return "CSRF_REQUIRED";
    case AuthStatus::kInvalidCredentials: return "INVALID_CREDENTIALS";
    case AuthStatus::kLoginLocked: return "LOGIN_LOCKED";
    case AuthStatus::kNoSessionSlot: return "NO_SESSION_SLOT";
    case AuthStatus::kExpired: return "EXPIRED";
  }
  return "UNKNOWN";
}

}  // namespace ventilation
