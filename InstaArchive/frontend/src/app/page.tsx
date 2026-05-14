"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import {
  Search,
  Download,
  Clock,
  Users,
  FileText,
  AtSign,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Key,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

const API_BASE = "http://localhost:8000/api/v1"

interface ProfileInfo {
  username: string
  full_name: string
  biography: string
  follower_count: number
  post_count: number
  profile_pic_url: string
  is_private: boolean
  is_verified: boolean
}

interface SessionStatus {
  session_loaded: boolean
  hint: string
}

export default function Dashboard() {
  const [username, setUsername] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [csrfToken, setCsrfToken] = useState("")
  const [showSession, setShowSession] = useState(false)
  const queryClient = useQueryClient()

  // Session status
  const sessionQuery = useQuery<SessionStatus>({
    queryKey: ["session-status"],
    queryFn: async () => (await axios.get(`${API_BASE}/session/status`)).data,
    refetchInterval: 10000,
  })

  // Profile lookup
  const profileQuery = useQuery<ProfileInfo>({
    queryKey: ["profile", username],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/profile/${username}`, { timeout: 20000 })
      return res.data
    },
    enabled: !!username,
    retry: false,
  })

  // Import session mutation
  const sessionMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${API_BASE}/session`, {
        sessionid: sessionId.trim(),
        csrftoken: csrfToken.trim() || undefined,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-status"] })
      setSessionId("")
      setCsrfToken("")
      setShowSession(false)
    },
  })

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async (targetUsername: string) => {
      const res = await axios.post(`${API_BASE}/sync`, { username: targetUsername })
      return res.data
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchInput.trim()
    if (trimmed) setUsername(trimmed)
  }

  const sessionLoaded = sessionQuery.data?.session_loaded ?? false

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            InstaArchive
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">Professional Instagram Archival System</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Session badge */}
          <button
            onClick={() => setShowSession(!showSession)}
            className={cn(
              "px-4 py-2 rounded-full border flex items-center gap-2 text-sm transition-all",
              sessionLoaded
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            )}
          >
            {sessionLoaded ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            {sessionLoaded ? "Session Active" : "No Session"}
            {showSession ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <div className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            API Online
          </div>
        </div>
      </div>

      {/* Session Import Panel */}
      {showSession && (
        <div className="mb-8 bg-zinc-900/80 border border-amber-500/20 rounded-3xl p-6 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-300">Import Instagram Session</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Instagram blocks anonymous scrapers. Provide your browser cookie to enable downloads.
              </p>
            </div>
          </div>

          <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4 mb-4 text-xs text-zinc-400 font-mono space-y-1">
            <p className="text-zinc-300 font-semibold mb-2">How to get your sessionid cookie:</p>
            <p>1. Open Instagram in your browser and log in</p>
            <p>2. Open DevTools → F12 → Application tab</p>
            <p>3. Expand Cookies → click <span className="text-amber-300">https://www.instagram.com</span></p>
            <p>4. Copy the value of <span className="text-green-400">sessionid</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">sessionid <span className="text-red-400">*</span></label>
              <input
                type="password"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Paste sessionid value..."
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">csrftoken (optional)</label>
              <input
                type="password"
                value={csrfToken}
                onChange={(e) => setCsrfToken(e.target.value)}
                placeholder="Paste csrftoken value..."
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => sessionMutation.mutate()}
            disabled={!sessionId || sessionMutation.isPending}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold rounded-xl text-sm transition-all flex items-center gap-2"
          >
            {sessionMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            {sessionMutation.isPending ? "Importing..." : "Import Session"}
          </button>

          {sessionMutation.isSuccess && (
            <p className="text-green-400 text-sm mt-3">✓ Session imported successfully!</p>
          )}
          {sessionMutation.isError && (
            <p className="text-red-400 text-sm mt-3">✗ Failed to import session. Check the value and try again.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-400" />
              Find Account
            </h2>
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. finedigitalstudiofilms"
                  className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-12 focus:ring-2 focus:ring-purple-500 transition-all outline-none text-sm"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>
              <button
                type="submit"
                disabled={profileQuery.isFetching}
                className="w-full py-3.5 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {profileQuery.isFetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Search Profile"}
              </button>
            </form>
            {profileQuery.isError && (
              <div className="text-xs mt-3 text-center space-y-1">
                <p className="text-red-400">Account not found or rate-limited.</p>
                <p className="text-zinc-600">
                  Make sure to{" "}
                  <button className="text-amber-400 underline" onClick={() => setShowSession(true)}>
                    import your session
                  </button>{" "}
                  and that the sessionid is <span className="text-zinc-400">URL-decoded</span> (no %3A).
                </p>
              </div>
            )}
          </div>

          {/* Profile Card */}
          {profileQuery.data && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16" />

              <div className="flex items-center gap-4">
                <img
                  src={profileQuery.data.profile_pic_url}
                  alt={profileQuery.data.username}
                  className="w-16 h-16 rounded-full border-2 border-pink-500/60 p-0.5"
                />
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-1.5">
                    {profileQuery.data.full_name}
                    {profileQuery.data.is_verified && (
                      <span className="text-blue-400 text-xs">✓</span>
                    )}
                  </h3>
                  <p className="text-zinc-500 text-sm">@{profileQuery.data.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 rounded-2xl p-3 border border-zinc-800/50">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                    <Users className="w-3 h-3" /> Followers
                  </div>
                  <div className="text-lg font-bold">{profileQuery.data.follower_count.toLocaleString()}</div>
                </div>
                <div className="bg-black/40 rounded-2xl p-3 border border-zinc-800/50">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                    <FileText className="w-3 h-3" /> Posts
                  </div>
                  <div className="text-lg font-bold">{profileQuery.data.post_count.toLocaleString()}</div>
                </div>
              </div>

              {profileQuery.data.biography && (
                <p className="text-zinc-400 text-xs leading-relaxed border-t border-zinc-800 pt-4">
                  {profileQuery.data.biography}
                </p>
              )}

              <button
                onClick={() => syncMutation.mutate(profileQuery.data!.username)}
                disabled={syncMutation.isPending || profileQuery.data.is_private}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 text-sm"
              >
                {syncMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {profileQuery.data.is_private ? "Private — Cannot Archive" : "Archive Account"}
              </button>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 min-h-[540px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-400" />
                Archival Progress
              </h2>
              {syncMutation.isSuccess && (
                <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                  Sync Active
                </span>
              )}
            </div>

            {!syncMutation.isPending && !syncMutation.isSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Download className="w-7 h-7 opacity-20" />
                </div>
                <div>
                  <p className="font-medium">No active archival jobs</p>
                  <p className="text-sm text-zinc-600">Search and select an account to begin</p>
                </div>
                {!sessionLoaded && (
                  <div className="mt-4 text-xs px-4 py-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400 max-w-xs">
                    ⚠️ No session imported. Instagram may block anonymous requests.{" "}
                    <button className="underline" onClick={() => setShowSession(true)}>
                      Import session
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="bg-black border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Download className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">@{profileQuery.data?.username}</div>
                        <div className="text-xs text-zinc-500">Running in background...</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full animate-pulse w-[20%]" />
                  </div>
                  <p className="text-xs text-zinc-600 mt-2">
                    Files are being saved to <code className="text-zinc-400">downloads/{profileQuery.data?.username}/</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Activity Log</h3>
                  <div className="bg-black/50 border border-zinc-800/50 rounded-2xl p-4 font-mono text-xs space-y-1.5 max-h-[280px] overflow-y-auto">
                    <div className="text-zinc-500">[INFO] Job initialized for @{profileQuery.data?.username}</div>
                    <div className="text-zinc-500">[INFO] Connecting to Instagram...</div>
                    <div className="text-green-500">[OK] Profile fetched — {profileQuery.data?.post_count} posts found</div>
                    <div className="text-zinc-400">[INFO] Checking existing downloads for incremental sync...</div>
                    <div className="text-zinc-500">[INFO] Downloading posts chronologically...</div>
                    <div className="text-zinc-600">[INFO] Delays randomized between 1.5–4s per post</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
