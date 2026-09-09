#!/usr/bin/env bash
# Pelican-Sim 1.0 preview on 0.0.0.0:8000.
# Prefers a detached tmux session (dualact-web) so it survives Cursor
# agent/shell exit and can be inspected with: tmux attach -t dualact-web
# Falls back to setsid if tmux is missing. Idempotent: never kills a healthy
# listener; only drops a stale pidfile, tmux session, or defunct OUR pid.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDFILE="${ROOT}/.preview.pid"
LOGFILE="${ROOT}/.preview.log"
PORT=8000
BIND="0.0.0.0"
SESSION="dualact-web"

is_alive() {
  local pid="${1:-}"
  [[ "${pid}" =~ ^[0-9]+$ ]] && kill -0 "${pid}" 2>/dev/null
}

pid_state() {
  ps -o state= -p "${1}" 2>/dev/null | awk '{print $1}'
}

port_listening() {
  python3 - "${PORT}" <<'PY'
import socket, sys
port = int(sys.argv[1])
s = socket.socket()
s.settimeout(0.4)
try:
    s.connect(("127.0.0.1", port))
except OSError:
    raise SystemExit(1)
else:
    raise SystemExit(0)
finally:
    s.close()
PY
}

read_pidfile() {
  if [[ -f "${PIDFILE}" ]]; then
    tr -d '[:space:]' < "${PIDFILE}" || true
  fi
}

tmux_available() {
  command -v tmux >/dev/null 2>&1
}

tmux_session_exists() {
  tmux_available && tmux has-session -t "${SESSION}" 2>/dev/null
}

print_ok() {
  local extra="${1:-}"
  echo "Pelican-Sim 1.0 preview ${extra}on ${BIND}:${PORT}"
  echo "http://127.0.0.1:${PORT}/"
  if tmux_session_exists; then
    echo "Inspect: tmux attach -t ${SESSION}   (detach: Ctrl-b d)"
  fi
}

if [[ -f "${PIDFILE}" ]]; then
  oldpid="$(read_pidfile)"
  if is_alive "${oldpid}"; then
    st="$(pid_state "${oldpid}")"
    if [[ "${st}" == Z* ]]; then
      rm -f "${PIDFILE}"
    elif port_listening; then
      print_ok "already running (pid ${oldpid}) "
      exit 0
    else
      kill -TERM "${oldpid}" 2>/dev/null || true
      sleep 0.2
      if is_alive "${oldpid}"; then
        st="$(pid_state "${oldpid}")"
        if [[ "${st}" == Z* ]] || ! is_alive "${oldpid}"; then
          :
        else
          kill -KILL "${oldpid}" 2>/dev/null || true
        fi
      fi
      rm -f "${PIDFILE}"
    fi
  else
    rm -f "${PIDFILE}"
  fi
fi

if port_listening; then
  print_ok "already listening "
  exit 0
fi

# Stale tmux session with nothing on the port: replace it.
if tmux_session_exists; then
  tmux kill-session -t "${SESSION}" 2>/dev/null || true
  sleep 0.2
fi

cd "${ROOT}"
mkdir -p "$(dirname "${PIDFILE}")"
touch "${LOGFILE}"

start_in_tmux() {
  tmux new-session -d -s "${SESSION}" -n preview -c "${ROOT}" \
    "echo \$\$ > '${PIDFILE}'
     while true; do
       echo \"[\$(date -Is)] Pelican-Sim 1.0 preview starting on ${BIND}:${PORT}\" | tee -a '${LOGFILE}'
       python3 -m http.server ${PORT} --bind ${BIND} 2>&1 | tee -a '${LOGFILE}'
       echo \"[\$(date -Is)] preview exited, restarting in 1s\" | tee -a '${LOGFILE}'
       sleep 1
     done"
}

start_with_setsid() {
  setsid -f bash -c "echo \$\$ > '${PIDFILE}' && exec python3 -m http.server ${PORT} --bind ${BIND}" \
    >>"${LOGFILE}" 2>&1 </dev/null
}

if tmux_available; then
  start_in_tmux
else
  echo "tmux not found; falling back to setsid" >&2
  start_with_setsid
fi

for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  newpid="$(read_pidfile)"
  if is_alive "${newpid}" && port_listening; then
    print_ok "started (pid ${newpid}) "
    exit 0
  fi
  sleep 0.2
done

echo "Failed to start Pelican-Sim 1.0 preview on ${BIND}:${PORT}; see ${LOGFILE}" >&2
if tmux_session_exists; then
  echo "tmux session ${SESSION} exists; attach with: tmux attach -t ${SESSION}" >&2
fi
exit 1
