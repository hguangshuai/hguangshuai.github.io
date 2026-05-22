import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const timeline = [
  {
    year: '2022',
    title: 'AI for Sensing',
    description:
      'Started focusing on machine learning pipelines for experimental sensing data.',
  },
  {
    year: '2023',
    title: 'EMI-Net Direction',
    description:
      'Built deep learning workflows for electromagnetic interference signal analysis.',
  },
  {
    year: '2024',
    title: 'Graph + Materials',
    description:
      'Expanded work to graph-based learning and materials-oriented research problems.',
  },
  {
    year: 'Now',
    title: 'AI-driven Science',
    description:
      'Continuing open-source projects that connect scientific discovery and deployable AI.',
  },
]

function App() {
  const [theme, setTheme] = useState('dark')
  const [particleMode, setParticleMode] = useState('attract')
  const [mouse, setMouse] = useState({ x: 50, y: 50 })
  const [repos, setRepos] = useState([])
  const [repoLoading, setRepoLoading] = useState(true)
  const [repoError, setRepoError] = useState('')
  const canvasRef = useRef(null)
  const pointerRef = useRef({ x: 0, y: 0 })

  const overviewCards = useMemo(
    () => [
      {
        title: 'Research Focus',
        content:
          'AI-driven research for materials design, sensor technology, and signal processing.',
      },
      {
        title: 'Featured Topics',
        content: 'EMI, graph learning, materials informatics, scientific machine learning.',
      },
      {
        title: 'Collaboration',
        content:
          'Open to research and engineering collaboration in AI for science and sensing.',
      },
    ],
    [],
  )

  const handlePointerMove = (event) => {
    const { clientX, clientY, currentTarget } = event
    const rect = currentTarget.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100
    setMouse({ x, y })
    pointerRef.current = { x: clientX, y: clientY }
  }

  useEffect(() => {
    const controller = new AbortController()

    const loadRepos = async () => {
      try {
        setRepoLoading(true)
        setRepoError('')
        const response = await fetch(
          'https://api.github.com/users/hguangshuai/repos?sort=updated&per_page=12',
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error('Failed to load repositories')
        }

        const data = await response.json()
        const topRepos = data
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 6)

        setRepos(topRepos)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setRepoError('Unable to load GitHub repositories right now.')
        }
      } finally {
        setRepoLoading(false)
      }
    }

    loadRepos()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    let animationId = 0
    let particles = []

    const buildParticles = (width, height) => {
      const count = Math.max(50, Math.min(110, Math.floor((width * height) / 14000)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 1.7 + 0.4,
      }))
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = document.documentElement.scrollHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildParticles(width, height)
    }

    const draw = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const pointer = pointerRef.current
      const particleColor =
        theme === 'dark' ? 'rgba(147, 197, 253, 0.9)' : 'rgba(37, 99, 235, 0.75)'
      const lineColor =
        theme === 'dark' ? 'rgba(125, 211, 252, 0.16)' : 'rgba(59, 130, 246, 0.14)'

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i]
        const dx = pointer.x - particle.x
        const dy = pointer.y - particle.y
        const dist = Math.hypot(dx, dy) || 1
        const forceBase = Math.min(1800 / (dist * dist), 0.32)
        const direction = particleMode === 'attract' ? 1 : -1
        const force = forceBase * direction

        particle.vx += (dx / dist) * force
        particle.vy += (dy / dist) * force
        particle.vx *= 0.97
        particle.vy *= 0.97

        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > width) particle.vx *= -1
        if (particle.y < 0 || particle.y > height) particle.vy *= -1

        particle.x = Math.max(0, Math.min(width, particle.x))
        particle.y = Math.max(0, Math.min(height, particle.y))

        ctx.beginPath()
        ctx.fillStyle = particleColor
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i]
          const b = particles[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist > 110) continue
          ctx.beginPath()
          ctx.strokeStyle = lineColor
          ctx.lineWidth = 0.6
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      animationId = window.requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [particleMode, theme])

  const handleCardTilt = (event) => {
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const rotateX = ((event.clientY - centerY) / rect.height) * -14
    const rotateY = ((event.clientX - centerX) / rect.width) * 14

    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`
  }

  const clearCardTilt = (event) => {
    event.currentTarget.style.transform = ''
  }

  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const nextParticleMode = particleMode === 'attract' ? 'repel' : 'attract'

  return (
    <main
      className={`page page-${theme}`}
      onPointerMove={handlePointerMove}
      style={{
        '--mouse-x': `${mouse.x}%`,
        '--mouse-y': `${mouse.y}%`,
      }}
    >
      <canvas ref={canvasRef} className="particles-canvas" aria-hidden="true" />

      <header className="topbar">
        <span className="tag">GitHub Homepage</span>
        <div className="top-actions">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setParticleMode(nextParticleMode)}
          >
            Particles: {particleMode} (switch to {nextParticleMode})
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setTheme(nextTheme)}
          >
            Theme: {theme} (switch to {nextTheme})
          </button>
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">Hi, I am</p>
        <h1>Jerry Han</h1>
        <p className="subtitle">
          AI-driven researcher advancing science with practical machine learning.
        </p>
      </section>

      <section className="overview-grid">
        {overviewCards.map((item) => (
          <article key={item.title} className="overview-card">
            <h3>{item.title}</h3>
            <p>{item.content}</p>
          </article>
        ))}
      </section>

      <section className="projects-section">
        <div className="section-heading">
          <h2>Live Repositories</h2>
          <p>Real-time stars and forks from GitHub API.</p>
        </div>
        {repoLoading ? <p className="repo-state">Loading repositories...</p> : null}
        {repoError ? <p className="repo-state">{repoError}</p> : null}
        <div className="repo-grid">
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              className="repo-card"
              target="_blank"
              rel="noreferrer"
              onMouseMove={handleCardTilt}
              onMouseLeave={clearCardTilt}
            >
              <h3>{repo.name}</h3>
              <p>{repo.description || 'No description available yet.'}</p>
              <div className="repo-meta">
                <span>Stars: {repo.stargazers_count}</span>
                <span>Forks: {repo.forks_count}</span>
                <span>{repo.language || 'N/A'}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="timeline-section">
        <div className="section-heading">
          <h2>Research Journey</h2>
          <p>Scroll to explore key milestones.</p>
        </div>
        <div className="timeline">
          {timeline.map((item) => (
            <article key={item.year + item.title} className="timeline-item">
              <span className="timeline-year">{item.year}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="links">
        <a href="https://github.com/hguangshuai" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="https://guangshuaihan.com/" target="_blank" rel="noreferrer">
          Website
        </a>
        <a href="mailto:youremail@example.com">Email</a>
        <a href="https://github.com/hguangshuai?tab=repositories" target="_blank" rel="noreferrer">
          Repositories
        </a>
      </footer>
    </main>
  )
}

export default App
