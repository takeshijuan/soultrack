export const Q1_POOL: readonly string[] = [
  '再出発', '嵐の中', '静水面', '霧の中', '炎の如く', '夜明け前',
  '別れ', '新しい扉', '重い沈黙', '揺れる大地', '待ちの季節',
  '解けない問い', '内なる戦い', '流れに逆らう', '壊れかけ',
  '信頼の危機', '創造の苦しみ', '孤独な戦い', '予期せぬ転換',
  '光の見えない道', '決断の岐路', '手放すとき', '守るべきもの',
  '変えられないもの', '自分との対話', '根を張るとき', '羽ばたく前夜',
  '静かな限界', '再び歩き出す', '何かの終わり',
] as const

export const Q2_POOL: readonly string[] = [
  '穏やか', '不安', '感謝', '怒り', '興奮', '疲労', '虚無', '希望',
  '悲しみ', '喜び', '迷い', '決意', '孤独', '愛', '恐れ', '誇り',
  '焦り', '解放感', '懐かしさ', '期待', '寂しさ', '驚き', '安堵',
  '羨望', '満足', '後悔', '勇気', '混乱', '平和', '渇望',
] as const

export const Q3_POOL: readonly string[] = [
  '背中を押す曲', '寄り添う曲', '解放する曲', '没入できる曲',
  '涙を誘う曲', '踊りたくなる曲', '瞑想できる曲', '前を向ける曲',
  '今を刻む曲', '静かに燃える曲', '宇宙に溶ける曲', '夜明けの曲',
  '嵐の中の曲', '終わりを飾る曲', 'また始める曲', '自分を許す曲',
  '強くなれる曲', '柔らかくなれる曲', '記憶を呼ぶ曲', '今夜だけの曲',
  '光の中の曲', '霧の中の曲', '沈黙を纏う曲', '高みへ向かう曲',
  '地に足をつける曲', '揺さぶる曲', '包み込む曲', '問いを立てる曲',
  '答えを手放す曲', '自分に還る曲',
] as const

export const ALL_POOLS = { q1: Q1_POOL, q2: Q2_POOL, q3: Q3_POOL }

// Precomputed sets for fast O(1) allowlist validation
export const Q1_SET: ReadonlySet<string> = new Set(Q1_POOL)
export const Q2_SET: ReadonlySet<string> = new Set(Q2_POOL)
export const Q3_SET: ReadonlySet<string> = new Set(Q3_POOL)
