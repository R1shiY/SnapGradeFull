// Top imports (add icons and hooks)
import { Card } from '../components/Card'
import { UploadDropzone } from '../components/UploadDropzone'
import { TextArea } from '../components/TextArea'
import { Button } from '../components/Button'
import { Gauge, User, CheckCircle2, ListOrdered, FileCode, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useState } from 'react'

export function BatchGrader() {
  const [results, setResults] = useState<
    null | Array<{
      name: string
      total: string
      breakdown: {
        label: string
        points: string
        expected: string
        student: string
        feedback: string
      }[]
    }>
  >(null)

  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  const toggle = (idx: number) =>
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card title="Assignments" subtitle="Batch upload multiple student files">
        <UploadDropzone
          title="Assignment Files"
          description="Upload multiple PDFs/images. Student names will be auto-detected where possible."
          accept=".pdf,image/*"
          multiple
        />
      </Card>

      <Card title="Rubric" subtitle="One rubric for all assignments">
        <UploadDropzone
          title="Rubric Files"
          description="Upload a single rubric (PDF/images) to apply across all."
          accept=".pdf,image/*"
        />
        <div className="mt-4">
          <TextArea
            label="Optional: Custom Rules"
            placeholder="Add constraints or overrides for batch grading..."
            rows={5}
          />
        </div>
      </Card>

      <Card title="Grade All" subtitle="Mock output for demo">
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() =>
              setResults([
                {
                  name: 'Jane Doe',
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
                      expected: '∫ 2x·cos(x^2) dx; u = x^2 → du = 2x dx → ∫ cos(u) du = sin(u) + C → sin(x^2)',
                      student: 'sin(x^2)',
                      feedback: 'Correct; explanation concise. Minor deduction for missing +C in general form.'
                    },
                    {
                      label: 'Q5: Word Problem (rate/mixture)',
                      points: '9 / 10',
                      expected: 'Set equations for rate mix; solve system; final: 3 liters added.',
                      student: '3 liters added',
                      feedback: 'Answer correct; partial work shown.'
                    }
                  ]
                },
                {
                  name: 'John Smith',
                  total: '40 / 50',
                  breakdown: [
                    {
                      label: 'Q1: Linear Equations',
                      points: '7 / 10',
                      expected: '2x - 4 = 10 → 2x = 14 → x = 7',
                      student: 'x = 6',
                      feedback: 'Arithmetic slip solving 2x = 14.'
                    },
                    {
                      label: 'Q2: Quadratic Roots',
                      points: '9 / 10',
                      expected: 'x^2 + x - 6 = (x + 3)(x - 2) → x = -3, 2',
                      student: 'x = -3, 2',
                      feedback: 'Correct; tiny deduction for missing factoring steps.'
                    },
                    {
                      label: 'Q3: Derivative (chain rule)',
                      points: '8 / 10',
                      expected: 'd/dx [sin(x^2)] = 2x·cos(x^2)',
                      student: '2x·cos(x^2)',
                      feedback: 'Correct.'
                    },
                    {
                      label: 'Q4: Definite Integral',
                      points: '8 / 10',
                      expected: '∫ x dx from 0→2 = [x^2/2]_0^2 = 2',
                      student: '2',
                      feedback: 'Correct; presentation minimal.'
                    },
                    {
                      label: 'Q5: Word Problem',
                      points: '8 / 10',
                      expected: 'System setup with units; final: 2.5 hours.',
                      student: '3 hours',
                      feedback: 'Rounding error; unit handling off by 0.5.'
                    }
                  ]
                },
                {
                  name: 'Alex Chen',
                  total: '45 / 50',
                  breakdown: [
                    {
                      label: 'Q1: Linear Equations',
                      points: '9 / 10',
                      expected: 'x/3 + 2 = 5 → x/3 = 3 → x = 9',
                      student: 'x = 9',
                      feedback: 'Correct; brief work shown.'
                    },
                    {
                      label: 'Q2: Quadratic Roots',
                      points: '10 / 10',
                      expected: 'x^2 - 4 = 0 → x = ±2',
                      student: 'x = ±2',
                      feedback: 'Correct.'
                    },
                    {
                      label: 'Q3: Derivative',
                      points: '9 / 10',
                      expected: 'd/dx [ln(x)] = 1/x',
                      student: '1/x',
                      feedback: 'Correct; minor deduction for domain note omission.'
                    },
                    {
                      label: 'Q4: Definite Integral',
                      points: '9 / 10',
                      expected: '∫ 1/x dx = ln|x| + C → ln(4) - ln(1) = ln 4',
                      student: 'ln 4',
                      feedback: 'Correct; no absolute value note.'
                    },
                    {
                      label: 'Q5: Word Problem',
                      points: '8 / 10',
                      expected: 'Rate × time; final: 12 km',
                      student: '12 km',
                      feedback: 'Correct; explanation terse.'
                    }
                  ]
                }
              ])
            }
          >
            <Gauge size={16} /> Grade All Assignments
          </Button>
          <div className="text-sm">
            <NavLink to="/" className="inline-flex items-center gap-2 text-sky-700 hover:underline">
              Switch to Single Grading
            </NavLink>
          </div>

          {results && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
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