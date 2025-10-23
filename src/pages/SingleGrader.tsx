import { Card } from '../components/Card'
import { UploadDropzone } from '../components/UploadDropzone'
import { TextArea } from '../components/TextArea'
import { Button } from '../components/Button'
import { Gauge, CheckCircle2, ListOrdered, User, FileCode, AlertCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useState } from 'react'

export function SingleGrader() {
  const [result, setResult] = useState<null | {
    studentName: string
    total: string
    breakdown: {
      label: string
      points: string
      expected: string
      student: string
      feedback: string
    }[]
  }>(null)
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Assignment */}
      <Card title="Assignment" subtitle="Upload PDFs, images, or docs">
        <UploadDropzone
          title="Assignment Files"
          description="Drag & drop pages or upload multiple images/PDF files."
          accept=".pdf,image/*"
          multiple
        />
      </Card>
      {/* Rubric */}
      <Card title="Rubric" subtitle="Upload rubric or leave blank to use general guidelines">
        <UploadDropzone
          title="Rubric Files"
          description="Drag & drop rubric files (PDF/images) or keep empty to use defaults."
          accept=".pdf,image/*"
          multiple={false}
        />
        <div className="mt-4">
          <TextArea
            label="Optional: Custom Rules"
            placeholder="Add specific scoring rules or constraints to override defaults..."
            rows={5}
          />
        </div>
      </Card>
      {/* Grade */}
      <Card title="Grade" subtitle="Mock output for demo">
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() =>
              setResult({
                studentName: 'Jane Doe',
                total: '43 / 50',
                breakdown: [
                  {
                    label: 'Q1: Linear Equations (solve for x)',
                    points: '8 / 10',
                    expected: '3x + 5 = 20 → 3x = 15 → x = 5',
                    student: '3x + 5 = 20 → x = 15',
                    feedback: 'Missed dividing by 3 in the final step.'
                  },
                  {
                    label: 'Q2: Quadratic Roots (factoring)',
                    points: '10 / 10',
                    expected: 'x^2 - 5x + 6 = (x - 2)(x - 3) → x = 2, 3',
                    student: '(x - 2)(x - 3) → x = 2, 3',
                    feedback: 'Correct.'
                  },
                  {
                    label: 'Q3: Derivative (product rule)',
                    points: '7 / 10',
                    expected: "d/dx [x·e^x] = e^x + x·e^x = e^x(1 + x)",
                    student: 'e^x + x·e^x',
                    feedback: 'Correct derivative; no simplification. Minor deduction.'
                  },
                  {
                    label: 'Q4: Definite Integral (u-substitution)',
                    points: '9 / 10',
                    expected: '∫ 2x·cos(x^2) dx; let u = x^2 → du = 2x dx → ∫ cos(u) du = sin(u) + C → sin(x^2)',
                    student: 'sin(x^2)',
                    feedback: 'Correct; explanation concise. Minor deduction for missing +C in general form.'
                  },
                  {
                    label: 'Q5: Word Problem (rate/mixture)',
                    points: '9 / 10',
                    expected: 'Set up equations for rate mix, solve system to find target ratio; final: 3 liters added.',
                    student: '3 liters added',
                    feedback: 'Answer correct; partial work shown.'
                  }
                ]
              })
            }
          >
            <Gauge size={16} /> Grade Assignment
          </Button>
          <div className="text-sm">
            <NavLink to="/batch" className="inline-flex items-center gap-2 text-sky-700 hover:underline">
              Switch to Batch Upload
            </NavLink>
          </div>
          {/* Result view */}
          {result && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-sky-50/60 border border-sky-100 p-3">
                  <div className="text-xs text-slate-600">Student</div>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="text-sky-600" size={16} />
                    <span className="text-sm font-medium">{result.studentName}</span>
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