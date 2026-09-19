import { useState, useEffect } from 'react'

function App() {
  const [clients, setClients] = useState([])
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')

  const fetchClients = () => {
    fetch('http://127.0.0.1:5000/api/clients')
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error('Failed to fetch clients:', err))
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()

    fetch('http://127.0.0.1:5000/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact, notes }),
    })
      .then((res) => res.json())
      .then(() => {
        setName('')
        setContact('')
        setNotes('')
        fetchClients()
      })
      .catch((err) => console.error('Failed to create client:', err))
  }

  return (
    <div className="min-h-screen bg-clot-beige p-8">
      <h1 className="text-4xl font-bold text-clot-brown mb-2">THE CLOT</h1>
      <p className="text-clot-brown/60 mb-8">CHECK + SLOT — client & appointment manager</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 max-w-md">
        <h2 className="text-lg font-semibold text-clot-brown mb-4">Add Client</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
        />

        <input
          type="text"
          placeholder="Contact (phone or Instagram)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
        />

        <textarea
          placeholder="Notes (design preferences, etc.)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        />

        <button
          type="submit"
          className="bg-clot-brown text-white px-6 py-2 rounded-full font-medium"
        >
          Add Client
        </button>
      </form>

      <h2 className="text-xl font-semibold text-clot-brown mb-4">Clients</h2>
      <ul className="space-y-2">
        {clients.map((client) => (
          <li key={client.id} className="bg-white p-4 rounded-lg shadow">
            <p className="font-medium">{client.name}</p>
            <p className="text-sm text-gray-500">{client.contact}</p>
            {client.notes && <p className="text-sm text-gray-400 italic mt-1">{client.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App