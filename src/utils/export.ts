import * as XLSX from 'xlsx'
import { GradingResult } from './grading'

type StudentResult = GradingResult & { name: string }

function parsePoints(s: string): { earned: number; max: number } {
  const m = s.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/)
  if (!m) return { earned: 0, max: 0 }
  const earned = Number(m[1])
  const max = Number(m[2])
  return { earned, max }
}

// Derive simple correctness categories
function categorize(earned: number, max: number) {
  if (max <= 0) return 'partial'
  const r = earned / max
  if (r >= 0.9) return 'correct'
  if (r >= 0.4) return 'partial'
  return 'incorrect'
}

// Compute per-student insights
export function computeStudentMetrics(r: StudentResult) {
  const total = parsePoints(r.total)
  const percent = total.max > 0 ? (total.earned / total.max) * 100 : 0

  let correct = 0
  let partial = 0
  let incorrect = 0

  const strengths: string[] = []
  const areas: string[] = []

  for (const b of r.breakdown) {
    const pts = parsePoints(b.points)
    const cat = categorize(pts.earned, pts.max)
    if (cat === 'correct') {
      correct++
      strengths.push(`${b.label}: ${b.feedback || 'Good work'}`)
    } else if (cat === 'partial') {
      partial++
      areas.push(`${b.label}: ${b.feedback || 'Partial credit, improve clarity/method'}`)
    } else {
      incorrect++
      areas.push(`${b.label}: ${b.feedback || 'Incorrect, revisit method/steps'}`)
    }
  }

  // Keep top few notes to avoid overly long cells
  const strengthsSummary = strengths.slice(0, 5).join(' | ')
  const areasSummary = areas.slice(0, 5).join(' | ')

  return {
    name: r.name,
    totalEarned: total.earned,
    totalMax: total.max,
    percent: `${percent.toFixed(1)}%`,
    correct,
    partial,
    incorrect,
    strengthsSummary,
    areasSummary,
  }
}

// Compute class-level metrics
export function computeClassMetrics(results: StudentResult[]) {
  const summary = results.map(computeStudentMetrics)
  const percents = summary.map(s => Number(s.percent.replace('%', '')))
  percents.sort((a, b) => a - b)
  const avg = percents.length ? (percents.reduce((a, b) => a + b, 0) / percents.length) : 0
  const median = percents.length
    ? percents.length % 2 === 1
      ? percents[(percents.length - 1) / 2]
      : (percents[percents.length / 2 - 1] + percents[percents.length / 2]) / 2
    : 0

  const totals = summary.reduce(
    (acc, s) => {
      acc.correct += s.correct
      acc.partial += s.partial
      acc.incorrect += s.incorrect
      return acc
    },
    { correct: 0, partial: 0, incorrect: 0 }
  )

  return {
    averagePercent: `${avg.toFixed(1)}%`,
    medianPercent: `${median.toFixed(1)}%`,
    distribution: totals,
    studentCount: results.length,
  }
}

export function exportBatchResultsToExcel(results: StudentResult[], rubricText?: string, customRules?: string) {
  if (!results.length) return

  const summaryRows: Array<{
    Student: string
    'Total Earned': number
    'Total Max': number
    Percent: string
  }> = []

  const breakdownRows: Array<{
    Student: string
    Question: string
    Earned: number
    Max: number
    Percent: string
    Expected: string
    StudentAnswer: string
    Feedback: string
    Category: 'correct' | 'partial' | 'incorrect'
  }> = []

  const insightsRows: Array<{
    Student: string
    Percent: string
    Correct: number
    Partial: number
    Incorrect: number
    Strengths: string
    'Areas to Improve': string
  }> = []

  let classEarned = 0
  let classMax = 0

  const perQuestion: Record<string, {
    attempts: number
    earnedSum: number
    maxSum: number
    correct: number
    partial: number
    incorrect: number
    feedbacks: string[]
  }> = {}

  for (const r of results) {
    const total = parsePoints(r.total)
    classEarned += total.earned
    classMax += total.max
    const percent = total.max > 0 ? ((total.earned / total.max) * 100).toFixed(1) + '%' : '0%'

    summaryRows.push({
      Student: r.name,
      'Total Earned': total.earned,
      'Total Max': total.max,
      Percent: percent,
    })

    let correct = 0
    let partial = 0
    let incorrect = 0
    const strengths: string[] = []
    const areas: string[] = []

    for (const b of r.breakdown) {
      const pts = parsePoints(b.points)
      const cat = categorize(pts.earned, pts.max)
      if (cat === 'correct') {
        correct++
        strengths.push(`${b.label}: ${b.feedback || 'Good work'}`)
      } else if (cat === 'partial') {
        partial++
        areas.push(`${b.label}: ${b.feedback || 'Partial credit, improve clarity/method'}`)
      } else {
        incorrect++
        areas.push(`${b.label}: ${b.feedback || 'Incorrect, revisit method/steps'}`)
      }

      breakdownRows.push({
        Student: r.name,
        Question: b.label,
        Earned: pts.earned,
        Max: pts.max,
        Percent: pts.max > 0 ? ((pts.earned / pts.max) * 100).toFixed(1) + '%' : '0%',
        Expected: b.expected,
        StudentAnswer: b.student,
        Feedback: b.feedback,
        Category: cat as any,
      })
      // Aggregate per-question stats
      const key = b.label
      if (!perQuestion[key]) {
        perQuestion[key] = {
          attempts: 0, earnedSum: 0, maxSum: 0,
          correct: 0, partial: 0, incorrect: 0,
          feedbacks: []
        }
      }
      const agg = perQuestion[key]
      agg.attempts += 1
      agg.earnedSum += pts.earned
      agg.maxSum += pts.max
      agg[cat] += 1
      if (b.feedback) agg.feedbacks.push(b.feedback)
    }

    insightsRows.push({
      Student: r.name,
      Percent: percent,
      Correct: correct,
      Partial: partial,
      Incorrect: incorrect,
      Strengths: strengths.slice(0, 5).join(' | '),
      'Areas to Improve': areas.slice(0, 5).join(' | '),
    })
  }

  const classAvgPercent =
    classMax > 0 ? ((classEarned / classMax) * 100).toFixed(1) + '%' : '0%'

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows)
  const breakdownSheet = XLSX.utils.json_to_sheet(breakdownRows)
  const insightsSheet = XLSX.utils.json_to_sheet(insightsRows)
  const classMetrics = computeClassMetrics(results)
  const statsSheet = XLSX.utils.json_to_sheet([
    { Metric: 'Class Total Earned', Value: classEarned },
    { Metric: 'Class Total Max', Value: classMax },
    { Metric: 'Class Average Percent (raw)', Value: classAvgPercent },
    { Metric: 'Class Average Percent (derived)', Value: classMetrics.averagePercent },
    { Metric: 'Class Median Percent', Value: classMetrics.medianPercent },
    { Metric: 'Student Count', Value: results.length },
    { Metric: 'Questions Correct (total)', Value: classMetrics.distribution.correct },
    { Metric: 'Questions Partial (total)', Value: classMetrics.distribution.partial },
    { Metric: 'Questions Incorrect (total)', Value: classMetrics.distribution.incorrect },
  ])
  const questionStatsRows: Array<{
    Question: string
    Attempts: number
    AvgEarned: number
    AvgMax: number
    AvgPercent: string
    Correct: number
    Partial: number
    Incorrect: number
    TopMistakes: string
  }> = []
  for (const [label, agg] of Object.entries(perQuestion)) {
    const avgEarned = agg.attempts ? agg.earnedSum / agg.attempts : 0
    const avgMax = agg.attempts ? agg.maxSum / agg.attempts : 0
    const avgPercent = avgMax > 0 ? ((avgEarned / avgMax) * 100).toFixed(1) + '%' : '0%'
    const topMistakes = summarizeMistakes(agg.feedbacks, 5)
    questionStatsRows.push({
      Question: label,
      Attempts: agg.attempts,
      AvgEarned: Number(avgEarned.toFixed(2)),
      AvgMax: Number(avgMax.toFixed(2)),
      AvgPercent: avgPercent,
      Correct: agg.correct,
      Partial: agg.partial,
      Incorrect: agg.incorrect,
      TopMistakes: topMistakes,
    })
  }

  const questionStatsSheet = XLSX.utils.json_to_sheet(questionStatsRows)
  const rubricSheet = XLSX.utils.json_to_sheet(
    (rubricText || customRules) ? [
      { Section: 'Rubric', Content: rubricText || '' },
      { Section: 'Custom Rules', Content: customRules || '' },
    ] : [{ Section: 'Rubric', Content: 'No rubric provided' }]
  )
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')
  XLSX.utils.book_append_sheet(wb, breakdownSheet, 'Breakdown')
  XLSX.utils.book_append_sheet(wb, insightsSheet, 'Insights')
  XLSX.utils.book_append_sheet(wb, statsSheet, 'Class Stats')
  XLSX.utils.book_append_sheet(wb, questionStatsSheet, 'Question Stats')
  XLSX.utils.book_append_sheet(wb, rubricSheet, 'Rubric')
  // Add a timestamped filename to avoid opening old exports
  const timestamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)
  XLSX.writeFile(wb, `SnapGrade_Report_${timestamp}.xlsx`)
}
function summarizeMistakes(feedbacks: string[], topN: number) {
  const stop = new Set(['the','and','to','of','in','a','is','for','on','with','that','this','should','step','error','incorrect','correct'])
  const counts: Record<string, number> = {}
  for (const fb of feedbacks) {
    for (const word of fb.toLowerCase().split(/[^a-z0-9]+/)) {
      if (!word || word.length < 3 || stop.has(word)) continue
      counts[word] = (counts[word] || 0) + 1
    }
  }
  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, topN)
  return sorted.map(([w,c]) => `${w} (${c})`).join(', ')
}