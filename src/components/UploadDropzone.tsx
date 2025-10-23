import { useRef, useState } from 'react'
import { FileText, Image as ImageIcon, UploadCloud, Trash2 } from 'lucide-react'
import { Button } from './Button'

type FileItem = {
  name: string
  size: number
  type: string
}

type Props = {
  title?: string
  description?: string
  accept?: string
  multiple?: boolean
}

export function UploadDropzone({ title, description, accept, multiple }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])

  const trigger = () => inputRef.current?.click()
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list) return
    const items: FileItem[] = Array.from(list).map(f => ({ name: f.name, size: f.size, type: f.type }))
    setFiles(prev => multiple ? [...prev, ...items] : items)
  }
  const clear = () => setFiles([])

  return (
    <div className="border-2 border-dashed border-sky-200 rounded-xl bg-sky-50/40 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UploadCloud className="text-sky-600" size={18} />
            <h4 className="font-semibold"> {title || 'Upload Files'} </h4>
          </div>
          <p className="text-sm text-slate-600">
            {description || 'Drop files here or click to browse. Supports PDF, images, docs.'}
          </p>
        </div>
        <Button variant="secondary" onClick={trigger}>Browse</Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={onChange}
        accept={accept}
        multiple={multiple}
      />
      <div
        className="mt-4 h-32 grid place-items-center rounded-lg bg-white border border-slate-200 cursor-pointer"
        onClick={trigger}
      >
        <div className="flex items-center gap-2 text-slate-500">
          <UploadCloud size={18} /> Click to select files
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">{files.length} file(s) selected</span>
            <Button variant="ghost" onClick={clear}>
              <Trash2 size={16} /> Clear
            </Button>
          </div>
          <ul className="divide-y divide-slate-100 bg-white rounded-lg border border-slate-200">
            {files.map((f, i) => (
              <li key={i} className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {f.type.includes('pdf') ? (
                    <FileText className="text-sky-600" size={16} />
                  ) : (
                    <ImageIcon className="text-sky-600" size={16} />
                  )}
                  <span className="text-sm">{f.name}</span>
                </div>
                <span className="text-xs text-slate-500">{(f.size / 1024).toFixed(1)} KB</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}