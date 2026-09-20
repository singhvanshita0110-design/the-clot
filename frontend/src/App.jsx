import { useState, useEffect } from 'react'

function App() {
  const [clients, setClients] = useState([])
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')

  const [clientId, setClientId] = useState('')
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [service, setService] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')
  const [appointments, setAppointments] = useState([])

  const fetchClients = () => {
    fetch('http://127.0.0.1:5000/api/clients')
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error('Failed to fetch clients:', err))
  }
  const fetchAppointments = () => {
  fetch('http://127.0.0.1:5000/api/appointments')
    .then((res) => res.json())
    .then((data) => setAppointments(data))
    .catch((err) => console.error('Failed to fetch appointments:', err))
}

  useEffect(() => {
    fetchClients()
    fetchAppointments()
  }, [])

  const handleAddClient = (e) => {
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

  const handleBookAppointment = (e) => {
    e.preventDefault()
    setBookingError('')
    setBookingSuccess('')
    fetchAppointments()

    fetch('http://127.0.0.1:5000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: parseInt(clientId),
        date,
        time_slot: timeSlot,
        service,
      }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong')
        }
        return data
      })
      .then(() => {
        setBookingSuccess('Appointment booked!')
        setClientId('')
        setDate('')
        setTimeSlot('')
        setService('')
      })
      .catch((err) => {
        setBookingError(err.message)
      })
  }
  

  return (
    <div className="min-h-screen bg-clot-beige p-8">
      <h1 className="text-4xl font-bold text-clot-brown mb-2">THE CLOT</h1>
      <p className="text-clot-brown/60 mb-8">CHECK + SLOT — client & appointment manager</p>

      <div className="flex flex-wrap gap-8 mb-8">
        <form onSubmit={handleAddClient} className="bg-white p-6 rounded-lg shadow max-w-md w-full">
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
          <button type="submit" className="bg-clot-brown text-white px-6 py-2 rounded-full font-medium">
            Add Client
          </button>
        </form>

        <form onSubmit={handleBookAppointment} className="bg-white p-6 rounded-lg shadow max-w-md w-full">
          <h2 className="text-lg font-semibold text-clot-brown mb-4">Book Appointment</h2>

          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
          >
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
          />

          <input
            type="time"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
          />

          <input
            type="text"
            placeholder="Service (e.g. Gel manicure)"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          />

          {bookingError && (
            <p className="text-red-600 text-sm mb-3">{bookingError}</p>
          )}
          {bookingSuccess && (
            <p className="text-green-600 text-sm mb-3">{bookingSuccess}</p>
          )}

          <button type="submit" className="bg-clot-brown text-white px-6 py-2 rounded-full font-medium">
            Book Appointment
          </button>
        </form>
      </div>

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

      <h2 className="text-xl font-semibold text-clot-brown mb-4 mt-8">Appointments</h2>
      <ul className="space-y-2">
        {appointments.map((appt) => {
          const client = clients.find((c) => c.id === appt.client_id)
          return (
            <li key={appt.id} className="bg-white p-4 rounded-lg shadow">
              <p className="font-medium">{client ? client.name : 'Unknown client'}</p>
              <p className="text-sm text-gray-500">
                {appt.date} at {appt.time_slot} — {appt.service || 'No service specified'}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default App