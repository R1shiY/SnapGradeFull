import { Card } from '../components/Card'
import { UploadDropzone } from '../components/UploadDropzone'
import { TextArea } from '../components/TextArea'
import { Button } from '../components/Button'
import { Gauge, CheckCircle2, ListOrdered, User, FileCode, AlertCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useState, ChangeEvent } from 'react'
import { extractTextAndImages } from '../utils/ocr'
import { gradeAssignment, GradingResult } from '../utils/grading'

export function SingleGrader() {
  const [result, setResult] = useState<GradingResult | null>(null)
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([])
  const [rubricFiles, setRubricFiles] = useState<File[]>([])
  const [customRules, setCustomRules] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const onCustomRulesChange = (e: ChangeEvent<HTMLTextAreaElement>) => setCustomRules(e.target.value)
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Assignment */}
      <Card title="Assignment" subtitle="Upload PDFs, images, or docs">
        <UploadDropzone
          title="Assignment Files"
          description="Drag & drop pages or upload multiple images/PDF files."
          accept=".pdf,image/*"
          multiple
          onFilesChange={setAssignmentFiles}
        />
      </Card>
      {/* Rubric */}
      <Card title="Rubric" subtitle="Upload rubric or leave blank to use general guidelines">
        <UploadDropzone
          title="Rubric Files"
          description="Drag & drop rubric files (PDF/images) or keep empty to use defaults."
          accept=".pdf,image/*"
          multiple={false}
          onFilesChange={setRubricFiles}
        />
        <div className="mt-4">
          {/* wire the TextArea to state */}
          <textarea
            rows={5}
            placeholder="Add specific scoring rules or constraints to override defaults..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            onChange={onCustomRulesChange}
          />
        </div>
      </Card>
      {/* Grade */}
      <Card title="Grade" subtitle="Runs OCR + Gemini grading">
        <div className="space-y-3">
          <Button
            className="w-full"
            disabled={loading || assignmentFiles.length === 0}
            onClick={async () => {
              try {
                setLoading(true)
                setResult(null)
                const assign = await extractTextAndImages(assignmentFiles)
                const rubric = rubricFiles.length ? await extractTextAndImages(rubricFiles) : { text: '', images: [] }
                const graded = await gradeAssignment({
                  assignmentText: assign.text,
                  rubricText: rubric.text,
                  customRules,
                  images: assign.images.length ? assign.images : undefined,
                })
                // fill student name from OCR text if missing
                if (!graded.studentName) {
                  const name = graded.studentName ?? ''
                  graded.studentName = name || undefined
                }
                setResult(graded)
              } catch (e) {
                console.error(e)
                alert('Grading failed: ' + (e as Error).message)
              } finally {
                setLoading(false)
              }
            }}
          >
            {loading ? <Gauge size={16} /> : <Gauge size={16} />} {loading ? 'Grading...' : 'Grade Assignment'}
          </Button>
          <div className="text-sm">
            <NavLink to="/batch" className="inline-flex items-center gap-2 text-sky-700 hover:underline">
              Switch to Batch Upload
            </NavLink>
          </div>

          {result && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-sky-50/60 border border-sky-100 p-3">
                  <div className="text-xs text-slate-600">Student</div>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="text-sky-600" size={16} />
                    <span className="text-sm font-medium">{result.studentName || 'Unknown'}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-sky-50/60 border border-sky-100 p-3">
                  <div className="text-xs text-slate-600">Total Score</div>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="text-sky-600" size={16} />
                    <span className="text-sm font-medium">{result.total}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white border border-slate-200">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 text-slate-700 font-semibold">
                  <ListOrdered size={16} /> Question Breakdown
                </div>
                <ul className="px-3 py-3 space-y-3 text-sm">
                  {result.breakdown.map((b, i) => (
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
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}