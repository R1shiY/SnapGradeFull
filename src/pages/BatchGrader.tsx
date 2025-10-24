// Top imports (add icons and hooks)
import { Card } from '../components/Card'
import { UploadDropzone } from '../components/UploadDropzone'
import { TextArea } from '../components/TextArea'
import { Button } from '../components/Button'
import { Gauge, User, CheckCircle2, ListOrdered, FileCode, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { extractTextAndImages } from '../utils/ocr'
import { gradeAssignment, GradingResult } from '../utils/grading'
import { exportBatchResultsToExcel, computeClassMetrics } from '../utils/export'

export function BatchGrader() {
  const [assignments, setAssignments] = useState<File[]>([])
  const [rubricFiles, setRubricFiles] = useState<File[]>([])
  const [customRules, setCustomRules] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Array<GradingResult & { name: string }>>([])
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [rubricText, setRubricText] = useState<string>('') // capture rubric for export

  const toggle = (idx: number) => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card title="Assignments" subtitle="Batch upload multiple student files">
        <UploadDropzone
          title="Assignment Files"
          description="Upload multiple PDFs/images. Student names will be auto-detected where possible."
          accept=".pdf,image/*"
          multiple
          onFilesChange={setAssignments}
        />
      </Card>

      <Card title="Rubric" subtitle="One rubric for all assignments">
        <UploadDropzone
          title="Rubric Files"
          description="Upload a single rubric (PDF/images) to apply across all."
          accept=".pdf,image/*"
          onFilesChange={setRubricFiles}
        />
        <div className="mt-4">
          <textarea
            rows={5}
            placeholder="Add constraints or overrides for batch grading..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            onChange={(e) => setCustomRules(e.target.value)}
          />
        </div>
      </Card>

      <Card title="Grade All" subtitle="Runs OCR + Gemini grading per student">
        <div className="space-y-3">
          <Button
            className="w-full"
            disabled={loading || assignments.length === 0}
            onClick={async () => {
              try {
                setLoading(true)
                setResults([])
                const rubric = rubricFiles.length ? await extractTextAndImages(rubricFiles) : { text: '', images: [] }
                setRubricText(rubric.text)
                const out: Array<GradingResult & { name: string }> = []
                for (let i = 0; i < assignments.length; i++) {
                  const file = assignments[i]
                  const single = await extractTextAndImages([file])
                  const graded = await gradeAssignment({
                    assignmentText: single.text,
                    rubricText: rubric.text,
                    customRules,
                    images: single.images.length ? single.images : undefined,
                  })
                  out.push({
                    ...graded,
                    name: graded.studentName || file.name.replace(/\.\w+$/, ''),
                  })
                  // Add delay between requests to avoid rate limits
                  if (i < assignments.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000))
                  }
                }
                setResults(out)
              } catch (e) {
                console.error(e)
                alert('Batch grading failed: ' + (e as Error).message)
              } finally {
                setLoading(false)
              }
            }}
          >
            {loading ? <Gauge size={16} /> : <Gauge size={16} />} {loading ? 'Grading...' : 'Grade All Assignments'}
          </Button>
          <div className="text-sm">
            <NavLink to="/" className="inline-flex items-center gap-2 text-sky-700 hover:underline">
              Switch to Single Grading
            </NavLink>
          </div>

          {results.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {/* Class metrics summary */}
              {(() => {
                const metrics = computeClassMetrics(results)
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-sky-50/60 border border-sky-100 p-3">
                      <div className="text-xs text-slate-600">Class Average</div>
                      <div className="text-sm font-medium">{metrics.averagePercent}</div>
                      <div className="mt-1 text-xs text-slate-600">Median: {metrics.medianPercent}</div>
                    </div>
                    <div className="rounded-lg bg-white border border-slate-200 p-3">
                      <div className="text-xs text-slate-600">Distribution</div>
                      <div className="mt-1 text-sm">
                        Correct: <span className="font-semibold">{metrics.distribution.correct}</span> •
                        Partial: <span className="font-semibold">{metrics.distribution.partial}</span> •
                        Incorrect: <span className="font-semibold">{metrics.distribution.incorrect}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  {results.length} student(s) graded
                </div>
                <Button
                  variant="secondary"
                  onClick={() => exportBatchResultsToExcel(results, rubricText, customRules)}
                >
                  Export to Excel
                </Button>
              </div>
              {results.map((stu, idx) => {
                const isOpen = !!expanded[idx]
                return (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-white">
                    <button
                      className="w-full px-3 py-3 flex items-center justify-between hover:bg-slate-50"
                      onClick={() => toggle(idx)}
                    >
                      <div className="flex items-center gap-3">
                        {isOpen ? (
                          <ChevronDown size={16} className="text-slate-600" />
                        ) : (
                          <ChevronRight size={16} className="text-slate-600" />
                        )}
                        <div className="flex items-center gap-2">
                          <User className="text-sky-600" size={16} />
                          <span className="text-sm font-medium">{stu.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-sky-600" size={16} />
                        <span className="text-sm font-semibold text-slate-800">{stu.total}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-3 pb-3">
                        <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 text-slate-700 font-semibold">
                          <ListOrdered size={16} /> Question Breakdown
                        </div>
                        <ul className="px-3 py-3 space-y-3 text-sm">
                          {stu.breakdown.map((b, i) => (
                            <li key={i} className="rounded-lg border border-slate-200 p-3">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{b.label}</span>
                                <span className="font-semibold text-slate-800">{b.points}</span>
                              </div>
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded-md border border-slate-200 bg-slate-50">
                                  <div className="px-2 py-1 border-b border-slate-200 text-xs font-semibold text-slate-600 inline-flex items-center gap-1">
                                    <FileCode size={14} className="text-sky-600" /> Expected
                                  </div>
                                  <pre className="px-2 py-2 text-slate-800 whitespace-pre-wrap">{b.expected}</pre>
                                </div>
                                <div className="rounded-md border border-slate-200 bg-white">
                                  <div className="px-2 py-1 border-b border-slate-200 text-xs font-semibold text-slate-600 inline-flex items-center gap-1">
                                    <FileCode size={14} className="text-sky-600" /> Student
                                  </div>
                                  <pre className="px-2 py-2 text-slate-800 whitespace-pre-wrap">{b.student}</pre>
                                </div>
                              </div>
                              <div className="mt-2 inline-flex items-center gap-2 text-slate-700">
                                <AlertCircle size={14} className="text-sky-600" />
                                <span>{b.feedback}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}