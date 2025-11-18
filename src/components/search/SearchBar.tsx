import React, { useState } from "react"

interface SearchBarProps {
  query: string
  onChange: (q: string) => void
  onSubmit: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onChange, onSubmit }) => {
  const [input, setInput] = useState(query)

  React.useEffect(() => {
    setInput(query)
  }, [query])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    onChange(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        background: "none",
        margin: "0",
        padding: "1.5rem 0 0.5rem 0",
      }}
    >
      <input
        type="text"
        value={input}
        onChange={handleInput}
        placeholder="Search what was actually said…"
        style={{
          width: "100%",
          maxWidth: 520,
          fontSize: "1.1rem",
          padding: "0.7em 1.2em",
          borderRadius: 8,
          border: "1px solid var(--border-subtle)",
          background: "var(--surface)",
          color: "var(--text)",
          outline: "none",
          boxShadow: "0 1px 6px 0 rgba(0,0,0,0.04)",
        }}
      />
      <button
        type="submit"
        style={{
          marginLeft: 12,
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "0.7em 1.3em",
          fontWeight: 600,
          fontSize: "1.1rem",
          cursor: "pointer",
          boxShadow: "0 1px 6px 0 rgba(0,0,0,0.04)",
        }}
      >
        Search
      </button>
    </form>
  )
}

export default SearchBar
