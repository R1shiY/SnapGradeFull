import { Card } from '../components/Card'
import { Toggle } from '../components/Toggle'
import { Button } from '../components/Button'

export function SettingsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Preferences" subtitle="Personalize your grading experience">
          <div className="space-y-3">
            <Toggle label="Enable Vision analysis by default" />
            <Toggle label="Fallback to general guidelines by default" />
            <Toggle label="Auto-detect student names by default" />
            <Toggle label="Include point breakdowns by default" />
          </div>
        </Card>
        <Card title="Appearance" subtitle="Theme and brand">
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Theme</label>
              <div className="grid grid-cols-2 gap-2">
                <button className="px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-sm">Light</button>
                <button className="px-3 py-2 rounded-md border border-slate-200 bg-slate-900 text-white hover:bg-slate-800 text-sm">Dark</button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Accent</label>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-sky-500 border border-slate-200" />
                <span className="w-6 h-6 rounded bg-sky-700 border border-slate-200" />
                <span className="w-6 h-6 rounded bg-indigo-500 border border-slate-200" />
                <span className="w-6 h-6 rounded bg-blue-500 border border-slate-200" />
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card title="Account" subtitle="Profile and security">
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Display Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                placeholder="you@school.edu"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <Button variant="primary" className="w-full">Save Changes</Button>
            <p className="text-xs text-slate-500">UI-only. Persistence to be added later.</p>
          </div>
        </Card>
        <Card title="Integrations" subtitle="OCR & Models (coming soon)">
          <div className="space-y-2 text-sm text-slate-600">
            <p>Configure OCR provider, Vision model, and grading model when backend is ready.</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50">Tesseract OCR</button>
              <button className="px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50">Google Vision</button>
              <button className="px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50">GPT-4 Vision</button>
              <button className="px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50">Gemini</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}