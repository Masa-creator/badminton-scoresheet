import { useState, useEffect, useRef } from 'react'
import styles from './IntervalTimer.module.css'

export default function IntervalTimer({ duration, label, onDone }) {
  const [remaining, setRemaining] = useState(duration)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const progress = remaining / duration
  const circumference = 2 * Math.PI * 54
  const strokeDash = circumference * progress

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`

  const colorClass = remaining <= 10 ? styles.urgent : remaining <= 30 ? styles.warning : styles.normal

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h2 className={styles.label}>{label}</h2>

        <div className={styles.timerWrap}>
          <svg className={styles.ring} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" className={styles.track} />
            <circle
              cx="60" cy="60" r="54"
              className={`${styles.progress} ${colorClass}`}
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeDashoffset="0"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <span className={`${styles.time} ${colorClass}`}>{timeStr}</span>
        </div>

        <div className={styles.buttons}>
          <button
            className={styles.toggleBtn}
            onClick={() => setRunning((r) => !r)}
          >
            {running ? '⏸ 一時停止' : '▶ 再開'}
          </button>
          <button className={styles.skipBtn} onClick={onDone}>
            スキップ →
          </button>
        </div>

        {remaining === 0 && (
          <div className={styles.doneMsg}>
            <p>インターバル終了！</p>
            <button className={styles.continueBtn} onClick={onDone}>
              試合を続ける
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
