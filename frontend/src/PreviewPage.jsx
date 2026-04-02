// frontend/src/PreviewPage.jsx
export default function PreviewPage({ previewUrls, brainResults }) {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 p-1 gap-1">
      <div className="flex gap-1 flex-[65]">
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl bg-white">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-100 bg-slate-50 shrink-0">
            V1 — Conservative
          </div>
          <iframe
            src={previewUrls[0]}
            className="flex-1 w-full border-0"
            title="V1 Conservative"
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl bg-white">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-100 bg-slate-50 shrink-0">
            V2 — Bold Redesign
          </div>
          <iframe
            src={previewUrls[1]}
            className="flex-1 w-full border-0"
            title="V2 Bold Redesign"
          />
        </div>
      </div>
      <div className="flex gap-1 flex-[35]">
        <div className="flex-1 overflow-auto rounded-xl bg-slate-800 p-3">
          <p className="text-xs font-semibold text-slate-400 mb-2">Brain V1</p>
          <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all">
            {JSON.stringify(brainResults[0], null, 2)}
          </pre>
        </div>
        <div className="flex-1 overflow-auto rounded-xl bg-slate-800 p-3">
          <p className="text-xs font-semibold text-slate-400 mb-2">Brain V2</p>
          <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all">
            {JSON.stringify(brainResults[1], null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
