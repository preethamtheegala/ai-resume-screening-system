'use client'

import { useState } from 'react'

export default function Home() {

  const [file, setFile] = useState<File | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleUpload = async () => {

    if (!file) {
      alert('Please select a resume')
      return
    }

    const formData = new FormData()
    formData.append('resume', file)
    formData.append(
      'email',
      email
    )
    

    try {

      setLoading(true)

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-resume-screening-system-kvrt.onrender.com'
      const response = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (response.ok) {
        setResult(data)
      } else {
        alert(data.error)
      }

setLoading(false)

    } catch (error) {

      console.error(error)
      alert('Backend connection failed')
      setLoading(false)

    }
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white px-6 py-10">

      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">

          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/10 px-5 py-2 rounded-full mb-6 backdrop-blur-md">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-200">AI Resume Screening System</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-indigo-200 to-cyan-300 text-transparent bg-clip-text">
            Smart Resume Analysis
          </h1>

          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-8">
            Upload resumes and get AI-powered candidate analysis using
            NLP, TF-IDF, and Cosine Similarity Matching.
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">

            <h2 className="text-3xl font-bold mb-3">
              Upload Resume
            </h2>

            <p className="text-gray-300 mb-8">
              Supported formats: PDF, DOC, DOCX
            </p>

            <div className="border-2 border-dashed border-indigo-400/40 rounded-2xl p-10 text-center bg-black/20">

              <div className="text-6xl mb-5">
                📄
              </div>

              <label className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 px-6 py-4 rounded-xl cursor-pointer inline-block font-semibold text-lg shadow-lg">
                Choose Resume

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              {file && (

                <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">

                  <p className="text-green-300 font-semibold text-lg">
                    {file.name}
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    Resume selected successfully
                  </p>

                </div>

              )}

              <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 outline-none mb-4"
              />

              <button
                onClick={handleUpload}
                className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:scale-[1.02] transition-all duration-300 py-4 rounded-xl text-lg font-bold shadow-xl"
              >
                Upload & Analyze Resume
              </button>

            </div>

            {loading && (

              <div className="mt-8">

                <div className="flex justify-between mb-2 text-sm text-gray-300">
                  <span>Processing Resume</span>
                  <span>Please wait...</span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-4 rounded-full animate-pulse w-full"></div>
                </div>

              </div>

            )}

          </div>

          <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">

            <h2 className="text-3xl font-bold mb-6">
              AI Analysis Result
            </h2>

            {!result && (

              <div className="h-full flex flex-col justify-center items-center text-center py-20">

                <div className="text-7xl mb-6 opacity-70">
                  🤖
                </div>

                <h3 className="text-2xl font-semibold mb-3">
                  Waiting for Resume
                </h3>

                <p className="text-gray-400 max-w-md leading-7">
                  Upload a resume to generate AI-based candidate analysis,
                  match percentage, and extracted resume content.
                </p>

              </div>

            )}

            {result && (

              <div>

                <div className="grid grid-cols-2 gap-4 mb-8">

                  <div className="bg-black/20 rounded-2xl p-5 border border-white/10">
                    <p className="text-gray-400 text-sm mb-2">
                      Uploaded File
                    </p>
                    <h3 className="text-lg font-bold break-words">
                      {result.filename}
                    </h3>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-2xl p-5 text-center">
                    <p className="text-sm mb-2 opacity-90">
                      Match Score
                    </p>
                    <h3 className="text-4xl font-black">
                      {result.match_percentage}%
                    </h3>
                  </div>

                </div>

                <div className="bg-black/20 border border-white/10 rounded-2xl p-6">

                  <h3 className="text-2xl font-bold mb-4">
                    Extracted Resume Text
                  </h3>

                  <div className="max-h-[500px] overflow-y-auto whitespace-pre-wrap text-gray-300 leading-7 text-sm pr-3">
                    {result.resume_text}
                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">

          <div className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">
              Fast Resume Parsing
            </h3>
            <p className="text-gray-400 leading-7 text-sm">
              Automatically extracts content from PDF and DOCX resumes.
            </p>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2">
              AI Match Engine
            </h3>
            <p className="text-gray-400 leading-7 text-sm">
              Uses TF-IDF vectorization and cosine similarity for analysis.
            </p>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">
              Smart Analytics
            </h3>
            <p className="text-gray-400 leading-7 text-sm">
              Generates candidate compatibility scores instantly.
            </p>
          </div>

        </div>

      </div>

    </div>

  )
}