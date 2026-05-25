import styles from './ScoreSheet.module.css'

function getPlayerName(players, mode, teamIdx, playerIdx = 0) {
  if (mode === 'singles') return players[teamIdx] ?? ''
  return players[teamIdx * 2 + playerIdx] ?? ''
}

function getTeamLabel(players, mode, teamIdx) {
  if (mode === 'singles') return players[teamIdx] ?? ''
  return `${players[teamIdx * 2] ?? ''}・${players[teamIdx * 2 + 1] ?? ''}`
}

export default function ScoreSheet({ history, players, mode }) {
  if (!history.length) return null

  return (
    <div className={styles.wrap}>
      <h3 className={styles.title}>📋 スコアシート</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.th} ${styles.leftTh}`}>
                {getTeamLabel(players, mode, 0)}
              </th>
              <th className={`${styles.th} ${styles.centerTh}`}>スコア</th>
              <th className={`${styles.th} ${styles.rightTh}`}>
                {getTeamLabel(players, mode, 1)}
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, i) => {
              const { scoringTeam, scores, serverInfo } = entry
              const isService0 = serverInfo.servingTeam === 0
              const isService1 = serverInfo.servingTeam === 1
              const scored0 = scoringTeam === 0
              const scored1 = scoringTeam === 1
              // ◉ = scored while serving, ○ = scored while receiving (won service)
              const mark0 = scored0 ? (isService0 ? '◉' : '○') : ''
              const mark1 = scored1 ? (isService1 ? '◉' : '○') : ''

              return (
                <tr key={i} className={scored0 ? styles.rowLeft : styles.rowRight}>
                  <td className={`${styles.td} ${styles.markCell} ${scored0 ? styles.scoredLeft : ''}`}>
                    {mark0 && (
                      <span className={`${styles.mark} ${mark0 === '◉' ? styles.markServe : styles.markReceive}`}>
                        {mark0}
                      </span>
                    )}
                    {scored0 && mode === 'doubles' && (
                      <span className={styles.scorer}>
                        {getPlayerName(players, mode, 0, serverInfo.servingTeam === 0 ? serverInfo.servingPlayerIdx : 1 - serverInfo.receivingPlayerIdx)}
                      </span>
                    )}
                  </td>
                  <td className={`${styles.td} ${styles.scoreCell}`}>
                    <span className={scored0 ? styles.scoreLeft : styles.scoreRight}>
                      {scores[0]}
                    </span>
                    <span className={styles.scoreSep}>–</span>
                    <span className={scored1 ? styles.scoreRight : styles.scoreLeft}>
                      {scores[1]}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.markCell} ${styles.markRight} ${scored1 ? styles.scoredRight : ''}`}>
                    {mark1 && (
                      <span className={`${styles.mark} ${mark1 === '◉' ? styles.markServe : styles.markReceive}`}>
                        {mark1}
                      </span>
                    )}
                    {scored1 && mode === 'doubles' && (
                      <span className={styles.scorer}>
                        {getPlayerName(players, mode, 1, serverInfo.servingTeam === 1 ? serverInfo.servingPlayerIdx : 1 - serverInfo.receivingPlayerIdx)}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.legend}>
        <span><span className={styles.markServe}>◉</span> サーブ側得点</span>
        <span><span className={styles.markReceive}>○</span> レシーブ側得点（サービス交代）</span>
      </div>
    </div>
  )
}
