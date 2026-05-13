'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HRDashboard() {

  const router = useRouter()

  const [resumes, setResumes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [jdFile, setJdFile] = useState<File | null>(null)

  const [search, setSearch] = useState('')

  const [analytics, setAnalytics] = useState({
    total_resumes: 0,
    shortlisted: 0,
    average_score: 0
  })

  useEffect(() => {

    const loggedIn = localStorage.getItem('hrLoggedIn')

    if (!loggedIn) {

      router.push('/hr-login')

      return
    }

    fetchResumes()
    fetchAnalytics()

  }, [])

  const fetchAnalytics = async () => {

    try {

      const response = await fetch(
        'https://ai-resume-screening-system-production-6bf1.up.railway.app/analytics'
      )

      const data = await response.json()

      setAnalytics({
        total_resumes: data.total_resumes || 0,
        shortlisted: data.shortlisted || 0,
        average_score: data.average_score || 0
      })

    } catch (error) {

      console.error(error)

    }
  }

  const fetchResumes = async () => {

    try {

      const response = await fetch(
        `https://ai-resume-screening-system-production-6bf1.up.railway.app/get-resumes?search=${search}`
      )

      const data = await response.json()

      if (Array.isArray(data)) {

        setResumes(data)

      } else {

        console.error(data)

        setResumes([])

      }

      setLoading(false)

    } catch (error) {

      console.error(error)

      setResumes([])

      setLoading(false)

    }
  }

  const uploadJobDescription = async () => {

    if (!jdFile) {

      alert('Please select JD file')

      return
    }

    const formData = new FormData()

    formData.append('jd_file', jdFile)

    try {

      const response = await fetch(
        'https://ai-resume-screening-system-production-6bf1.up.railway.app/upload-job-description',
        {
          method: 'POST',
          body: formData
        }
      )

      const data = await response.json()

      alert(data.message || data.error)
      fetchResumes()
      fetchAnalytics()

    } catch (error) {

      console.error(error)

      alert('Failed to upload JD')

    }
  }

  const updateStatus = async (
    id: number,
    status: string
  ) => {

    try {

      await fetch(
        `https://ai-resume-screening-system-production-6bf1.up.railway.app/update-status/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status
          })
        }
      )

      fetchResumes()
      fetchAnalytics()

    } catch (error) {

      console.error(error)

    }
  }
const sendEmail = async (
  email: string,
  status: string
) => {

  try {

    const response = await fetch(
      'https://ai-resume-screening-system-production-6bf1.up.railway.app/send-email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          subject: `Application ${status}`,
          message:
            status === 'Shortlisted'
              ? 'Congratulations! You have been shortlisted for the next round.'
              : 'Thank you for applying. Your profile was not shortlisted this time.'
        })
      }
    )

    const data = await response.json()

    alert(data.message)

  } catch (error) {

    console.error(error)

    alert('Failed to send email')

  }
}

  const deleteResume = async (id: number) => {

    try {

      await fetch(
        `https://ai-resume-screening-system-production-6bf1.up.railway.app/delete-resume/${id}`,
        {
          method: 'DELETE'
        }
      )

      fetchResumes()
      fetchAnalytics()

    } catch (error) {

      console.error(error)

    }
  }

  const logout = () => {

    localStorage.removeItem('hrLoggedIn')

    router.push('/hr-login')
  }

  return (

    <div className="min-h-screen bg-slate-950 text-white p-8">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-10">

          <div>

            <h1 className="text-5xl font-black mb-2">
              AI ATS Dashboard
            </h1>

            <p className="text-gray-400">
              Advanced Recruitment Intelligence System
            </p>

          </div>

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-semibold"
          >
            Logout
          </button>

        </div>

        <div className="bg-white/10 border border-white/10 rounded-3xl p-8 mb-10">

          <h2 className="text-3xl font-bold mb-6">
            Upload Job Description
          </h2>

          <div className="space-y-5">

            <label className="bg-indigo-600 hover:bg-indigo-700 px-6 py-4 rounded-xl cursor-pointer inline-block font-semibold">

              Choose JD File

              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setJdFile(e.target.files?.[0] || null)}
                className="hidden"
              />

            </label>

            {jdFile && (

              <p className="text-green-400">
                {jdFile.name}
              </p>

            )}

            <button
              onClick={uploadJobDescription}
              className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-xl font-semibold"
            >
              Upload Requirement
            </button>

          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white/10 border border-white/10 rounded-2xl p-6">

            <h3 className="text-gray-400 mb-2">
              Total Resumes
            </h3>

            <p className="text-5xl font-black">
              {analytics.total_resumes}
            </p>

          </div>

          <div className="bg-white/10 border border-white/10 rounded-2xl p-6">

            <h3 className="text-gray-400 mb-2">
              Shortlisted
            </h3>

            <p className="text-5xl font-black text-green-400">
              {analytics.shortlisted}
            </p>

          </div>

          <div className="bg-white/10 border border-white/10 rounded-2xl p-6">

            <h3 className="text-gray-400 mb-2">
              Average Score
            </h3>

            <p className="text-5xl font-black text-cyan-400">
              {analytics.average_score}%
            </p>

          </div>

        </div>

        <div className="mb-8">

          <input
            type="text"
            placeholder="Search resumes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyUp={fetchResumes}
            className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 outline-none"
          />

        </div>

        <div className="bg-white/10 border border-white/10 rounded-3xl overflow-hidden">

          <div className="p-6 border-b border-white/10">

            <h2 className="text-3xl font-bold">
              Candidate Rankings
            </h2>

          </div>

          {loading ? (

            <div className="p-10 text-center text-gray-400">
              Loading resumes...
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-black/30">

                  <tr>

                    <th className="text-left p-5">
                      ID
                    </th>

                    <th className="text-left p-5">
                      Filename
                    </th>

                    <th className="text-left p-5">
                      Match Score
                    </th>

                    <th className="text-left p-5">
                      Skills
                    </th>

                    <th className="text-left p-5">
                      Status
                    </th>

                    <th className="text-left p-5">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {Array.isArray(resumes) && resumes.map((resume, index) => (

                    <tr
                      key={index}
                      className="border-t border-white/10 hover:bg-white/5"
                    >

                      <td className="p-5">
                        {resume.id}
                      </td>

                      <td className="p-5">
                        {resume.filename}
                      </td>

                      <td className="p-5 font-bold text-cyan-400">
                        {resume.match_percentage}%
                      </td>

                      <td className="p-5">

                        <div className="flex flex-wrap gap-2">

                          {resume.skills?.split(',').map(
                            (skill: string, idx: number) => (

                              <span
                                key={idx}
                                className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm"
                              >
                                {skill}
                              </span>

                            )
                          )}

                        </div>

                      </td>

                      <td className="p-5">

                        <span className={`
                          px-3 py-1 rounded-full text-sm
                          ${resume.status === 'Shortlisted'
                            ? 'bg-green-500/20 text-green-400'
                            : resume.status === 'Rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                          }
                        `}>

                          {resume.status}

                        </span>

                      </td>

                      <td className="p-5">

                        <div className="flex gap-2 flex-wrap">

                          <button
                            onClick={() =>
                              updateStatus(
                                resume.id,
                                'Shortlisted'
                              )
                            }
                            className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm"
                          >
                            Shortlist
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(
                                resume.id,
                                'Rejected'
                              )
                            }
                            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-lg text-sm"
                          >
                            Reject
                          </button>

                          <button
                           onClick={() =>
                            sendEmail(
                              resume.email,
                              resume.status
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm"
                          >
                            Send Mail
                          </button>

                          <button
                            onClick={() =>
                              deleteResume(resume.id)
                            }
                            className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  )
}