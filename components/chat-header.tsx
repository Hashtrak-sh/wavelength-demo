import { Badge } from "@/components/ui/badge"

export function ChatHeader() {
  return (
    <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
          <span className="text-white font-bold">W</span>
        </div>
        <div>
          <h2 className="font-semibold text-white">Wavelength Assistant</h2>
          <p className="text-xs text-gray-400">Powered by Claude</p>
        </div>
      </div>
      <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700">
        Claude 3 Opus
      </Badge>
    </div>
  )
}
